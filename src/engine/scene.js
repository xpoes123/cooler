import { Player } from './player.js';
import { SPRITES, walkSprite } from './sprites.js';

function inFootprint(i, x, y) {
  const w = i.w ?? 1;
  const h = i.h ?? 1;
  return x >= i.x && x < i.x + w && y >= i.y && y < i.y + h;
}

// Pick a walk-cycle sprite if one is registered for the prefix; fall back
// to the idle facing sprite (e.g. 'sal_walk_down_a' or 'sal').
function spriteForCharacter(prefix, facing, moving, phase) {
  if (moving) {
    const cycled = walkSprite(prefix, facing, phase);
    if (cycled) return cycled;
  }
  // Idle / no walk cycle registered — try directional then base.
  return SPRITES[`${prefix}_${facing}`] ?? SPRITES[prefix] ?? null;
}

export class Scene {
  constructor({ input, renderer, dialogue, state, eggs, sfx, audio }) {
    this.input = input;
    this.renderer = renderer;
    this.dialogue = dialogue;
    this.state = state;
    this.eggs = eggs;
    this.sfx = sfx;
    this.audio = audio;

    this.rooms = {};
    this.games = {};
    this.room = null;
    this.player = new Player(0, 0);

    this.currentGame = null;
  }

  registerRooms(map) {
    for (const k of Object.keys(map)) {
      const r = map[k];
      if (r && r.id) this.rooms[r.id] = r;
    }
  }
  registerGames(map) {
    for (const k of Object.keys(map)) {
      const g = map[k];
      if (g && g.id) this.games[g.id] = g;
    }
  }

  loadRoom(idOrRoom, entryName = null) {
    const room = (typeof idOrRoom === 'string') ? this.rooms[idOrRoom] : idOrRoom;
    if (!room) {
      console.warn('loadRoom: unknown room', idOrRoom);
      return;
    }
    this.room = room;
    let entry = null;
    if (entryName && room.entries && room.entries[entryName]) {
      entry = room.entries[entryName];
    } else if (room.start) {
      entry = room.start;
    } else {
      entry = { x: 1, y: 1, facing: 'down' };
    }
    this.player.tile = { x: entry.x, y: entry.y };
    this.player.facing = entry.facing ?? 'down';
    this.player.dx = 0;
    this.player.dy = 0;
    this.player.moving = false;
    this.player.dest = null;
    this._save();
  }

  enterGame(idOrGame) {
    const game = (typeof idOrGame === 'string') ? this.games[idOrGame] : idOrGame;
    if (!game) {
      console.warn('enterGame: unknown game', idOrGame);
      return;
    }
    this.currentGame = game;
    if (typeof game.onEnter === 'function') {
      game.onEnter({
        sfx: this.sfx,
        audio: this.audio,
        dialogue: this.dialogue,
        exit: () => this.exitGame(),
      });
    }
  }

  exitGame() {
    if (!this.currentGame) return;
    if (typeof this.currentGame.onExit === 'function') {
      try { this.currentGame.onExit({ sfx: this.sfx }); } catch (e) { console.error(e); }
    }
    this.currentGame = null;
  }

  _interactCtx() {
    return {
      dialogue: this.dialogue,
      state: this.state,
      eggs: this.eggs,
      player: this.player,
      scene: this,
      sfx: this.sfx,
      audio: this.audio,
    };
  }

  update(dt) {
    if (this.currentGame) {
      try {
        this.currentGame.update(dt, this.input, this.dialogue, this.sfx);
      } catch (e) { console.error(e); }
      if (this.currentGame.done) this.exitGame();
      return;
    }

    this.player.update(dt, this.input, this.room, this.sfx);

    if (this.room?.npcs) {
      for (const npc of this.room.npcs) {
        if (typeof npc.update === 'function') {
          try { npc.update(dt, this.room, this); } catch (e) { console.error(e); }
        }
      }
    }

    if (this.input.justPressed('KeyE') && !this.player.moving) {
      const target = this.player.facingTile();
      const obj = this._findInteractable(target.x, target.y);
      if (obj?.onInteract) {
        if (this.sfx) this.sfx.interact();
        try { obj.onInteract(this._interactCtx()); } catch (e) { console.error(e); }
        this._save();
      }
    }
  }

  _findInteractable(x, y) {
    const npc = this.room.npcs?.find(n => n.x === x && n.y === y);
    if (npc && npc.onInteract) return npc;
    return this.room.interactables?.find(i => inFootprint(i, x, y));
  }

  _save() {
    if (!this.room) return;
    this.state.save({
      v: 4,
      roomId: this.room.id,
      player: {
        x: this.player.tile.x,
        y: this.player.tile.y,
        facing: this.player.facing,
      },
    });
  }

  render() {
    const r = this.renderer;
    if (!this.room) return;

    // Tile grid
    for (let y = 0; y < this.room.tiles.length; y++) {
      for (let x = 0; x < this.room.tiles[y].length; x++) {
        const t = this.room.tiles[y][x];
        const def = this.room.tileTypes[t];
        if (def?.sprite) {
          r.drawSprite(SPRITES[def.sprite], x * r.tile, y * r.tile);
        } else if (def?.color) {
          r.fillTile(x, y, def.color);
        }
      }
    }

    // Interactables
    if (this.room.interactables) {
      for (const i of this.room.interactables) {
        if (i.hidden) continue;
        if (i.sprite) {
          r.drawSprite(SPRITES[i.sprite], i.x * r.tile, i.y * r.tile);
        } else if (i.color) {
          const w = i.w ?? 1;
          const h = i.h ?? 1;
          for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
              r.fillTile(i.x + dx, i.y + dy, i.color);
            }
          }
        }
      }
    }

    // NPCs (with optional walk-cycle prefix)
    if (this.room.npcs) {
      for (const npc of this.room.npcs) {
        const prefix = npc.spritePrefix ?? npc.sprite;
        const facing = npc.facing ?? 'down';
        const moving = !!npc.moving;
        const phase = npc.walkPhase ?? 0;
        const sprite = spriteForCharacter(prefix, facing, moving, phase);
        if (sprite) r.drawSprite(sprite, npc.x * r.tile, npc.y * r.tile);
      }
    }

    // Player
    const playerSprite = spriteForCharacter('pro', this.player.facing, this.player.moving, this.player.walkPhase);
    if (playerSprite) {
      const px = this.player.tile.x * r.tile + this.player.dx;
      const py = this.player.tile.y * r.tile + this.player.dy;
      r.drawSprite(playerSprite, px, py);
    }

    // Interact prompt
    if (!this.dialogue.active && !this.player.moving) {
      const target = this.player.facingTile();
      const obj = this._findInteractable(target.x, target.y);
      if (obj) {
        r.fillPixel(target.x * r.tile + 7, target.y * r.tile - 4, 2, 2, '#bca838');
      }
    }

    // Game overlay
    if (this.currentGame && typeof this.currentGame.render === 'function') {
      try { this.currentGame.render(r, r.ctx); } catch (e) { console.error(e); }
    }
  }
}
