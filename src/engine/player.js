const MOVE_TIME = 0.12;
const WALK_FRAME_SEC = 1 / 6; // 6 fps ping-pong per design system

const DIR_VEC = {
  up:    [0, -1],
  down:  [0,  1],
  left:  [-1, 0],
  right: [ 1, 0],
};

function inFootprint(i, x, y) {
  const w = i.w ?? 1;
  const h = i.h ?? 1;
  return x >= i.x && x < i.x + w && y >= i.y && y < i.y + h;
}

export class Player {
  constructor(x, y) {
    this.tile = { x, y };
    this.dx = 0;
    this.dy = 0;
    this.facing = 'down';
    this.moving = false;
    this.dest = null;
    this.elapsed = 0;
    this.walkPhase = 0;     // 0 or 1 — used to pick walk-A vs walk-B sprite
    this._walkAccum = 0;
    this._bumpCooldown = 0;
  }

  update(dt, input, room, sfx) {
    if (this._bumpCooldown > 0) this._bumpCooldown -= dt;

    if (this.moving) {
      this.elapsed += dt;
      this._walkAccum += dt;
      if (this._walkAccum >= WALK_FRAME_SEC) {
        this._walkAccum -= WALK_FRAME_SEC;
        this.walkPhase = 1 - this.walkPhase;
      }
      const t = Math.min(this.elapsed / MOVE_TIME, 1);
      const tile = 16;
      const dvx = this.dest.x - this.tile.x;
      const dvy = this.dest.y - this.tile.y;
      this.dx = dvx * tile * t;
      this.dy = dvy * tile * t;
      if (t >= 1) {
        this.tile = { ...this.dest };
        this.dest = null;
        this.dx = 0;
        this.dy = 0;
        this.moving = false;
        this.elapsed = 0;
      }
      return;
    }

    // Idle — reset walk anim so the next move starts on frame A.
    this._walkAccum = 0;
    this.walkPhase = 0;

    const dir = input.dir;
    if (!dir) return;
    this.facing = dir;
    const [ox, oy] = DIR_VEC[dir];
    const tx = this.tile.x + ox;
    const ty = this.tile.y + oy;
    if (this._blocked(tx, ty, room)) {
      if (sfx && this._bumpCooldown <= 0) {
        sfx.bumpWall();
        this._bumpCooldown = 0.25;
      }
      return;
    }
    if (sfx) sfx.step();
    this.dest = { x: tx, y: ty };
    this.moving = true;
    this.elapsed = 0;
  }

  facingTile() {
    const [ox, oy] = DIR_VEC[this.facing];
    return { x: this.tile.x + ox, y: this.tile.y + oy };
  }

  _blocked(x, y, room) {
    if (y < 0 || y >= room.tiles.length) return true;
    if (x < 0 || x >= room.tiles[0].length) return true;
    const t = room.tiles[y][x];
    const def = room.tileTypes[t];
    if (def?.solid) return true;
    if (room.interactables?.some(i => i.solid !== false && i.hidden !== true && inFootprint(i, x, y))) return true;
    if (room.npcs?.some(n => n.x === x && n.y === y)) return true;
    return false;
  }
}
