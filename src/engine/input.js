const PREVENT = new Set([
  'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ',
]);

export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.heldFor = new Map();

    window.addEventListener('keydown', (e) => {
      if (PREVENT.has(e.key)) e.preventDefault();
      if (e.repeat) return;
      this.pressed.add(e.code);
      this.down.add(e.code);
      this.heldFor.set(e.code, 0);
    });

    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
      this.heldFor.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.down.clear();
      this.heldFor.clear();
    });
  }

  isDown(code) { return this.down.has(code); }
  justPressed(code) { return this.pressed.has(code); }

  heldSeconds(code) {
    return this.heldFor.get(code) ?? 0;
  }

  // call once per frame after consumers read input
  endFrame(dt) {
    this.pressed.clear();
    for (const code of this.down) {
      this.heldFor.set(code, (this.heldFor.get(code) ?? 0) + dt);
    }
  }

  // Map WASD/arrows -> direction string
  get dir() {
    if (this.isDown('KeyW') || this.isDown('ArrowUp')) return 'up';
    if (this.isDown('KeyS') || this.isDown('ArrowDown')) return 'down';
    if (this.isDown('KeyA') || this.isDown('ArrowLeft')) return 'left';
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) return 'right';
    return null;
  }
}
