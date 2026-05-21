import { Input } from './engine/input.js';
import { Renderer } from './engine/render.js';
import { Scene } from './engine/scene.js';
import { State } from './engine/state.js';
import { Dialogue } from './engine/dialogue.js';
import { Eggs } from './engine/eggs.js';
import { Audio } from './engine/audio.js';
import { SFX } from './engine/sfx.js';
import { Inventory } from './engine/inventory.js';
import { loadSheet } from './engine/sprites.js';

import * as roomsMap from './rooms/index.js';
import * as gamesMap from './games/index.js';

const TILE = 16;
const SAVE_KEY = 'cooler-save-v4';
const START_ROOM = 'back_office';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const muteEl = document.getElementById('mute');
const titleEl = document.getElementById('title');

async function boot() {
  const sheet = await loadSheet();

  const input = new Input();
  const renderer = new Renderer(ctx, TILE, sheet);
  const dialogue = new Dialogue();
  const state = new State(SAVE_KEY);
  const eggs = new Eggs();
  const audio = new Audio();
  const sfx = new SFX();
  const inventory = new Inventory();
  const scene = new Scene({ input, renderer, dialogue, state, eggs, sfx, audio });

  dialogue.setSFX(sfx);

  scene.registerRooms(roomsMap);
  scene.registerGames(gamesMap);

  audio.onMuteChange = (muted) => {
    if (muteEl) muteEl.textContent = muted ? '♪ OFF' : '♪ ON';
  };

  // Start with the saved room if it exists, else the start room.
  const saved = state.load();
  const savedRoom = saved?.v === 4 && saved?.roomId && scene.rooms[saved.roomId];
  if (savedRoom) {
    scene.loadRoom(saved.roomId);
    if (saved.player) {
      scene.player.tile = { x: saved.player.x, y: saved.player.y };
      scene.player.facing = saved.player.facing ?? 'down';
    }
  } else {
    scene.loadRoom(START_ROOM);
  }

  // Music + SFX both need a user gesture before AudioContext can start.
  // The same first keypress also dismisses the title screen.
  let titleActive = true;
  window.addEventListener(
    'keydown',
    () => {
      audio.start();
      if (audio.ctx && audio.master) sfx.attach(audio.ctx, audio.master);
      if (titleActive) {
        titleActive = false;
        if (titleEl) titleEl.classList.remove('active');
      }
    },
    { once: true }
  );

  // Sample easter eggs (proof of registry — final triggers designed later).
  eggs.registerSequence({
    id: 'konami',
    sequence: [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA',
    ],
    onTrigger: () => {
      sfx.jackpot();
      dialogue.show([{ text: 'A single chip clatters out of the wall vent.' }]);
    },
  });

  eggs.registerHold({
    id: 'reset',
    code: 'KeyR',
    seconds: 3,
    onTrigger: () => {
      state.reset();
      dialogue.show([{ text: 'Save wiped. Reload the page to begin again.' }]);
    },
  });

  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;

    if (input.justPressed('KeyM')) audio.toggleMute();
    if (input.justPressed('Tab') && !titleActive && !dialogue.active) {
      inventory.toggle(sfx);
    }

    if (inventory.open) {
      inventory.update(input, sfx);
    } else if (dialogue.active) {
      dialogue.update(input, dt);
    } else {
      scene.update(dt);
    }
    eggs.update(input, dt);

    renderer.clear('#1a1a2e');
    scene.render();

    input.endFrame(dt);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

boot().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    '<pre style="color:#a82820;font-family:monospace;padding:24px">' +
    String(err.message || err) + '</pre>';
});
