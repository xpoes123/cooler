// ROULETTE — single-zero wheel skeleton.
// Left/Right scrolls cursor over numbers 0-36. E places bet on cursor.
// After bet, wheel "spins" briefly, ball lands on a random number.
// SFX: menuMove on scroll, interact on bet, rouletteSpin during spin,
// rouletteBall on ball drop, win/lose on result. ESC/Q exits.

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function colorFor(n) {
  if (n === 0) return '#2c6c6c';        // dirty-teal for zero
  return RED.has(n) ? '#a82820' : '#1a1a2e';
}

export const roulette = {
  id: 'roulette',
  name: 'ROULETTE',
  done: false,

  cursor: 0,            // 0..36
  bet: -1,              // -1 = none
  state: 'pick',        // 'pick' | 'spin' | 'result'
  spinT: 0,
  ball: -1,
  resultMsg: '',

  onEnter({ sfx }) {
    this.done = false;
    this.cursor = 17;
    this.bet = -1;
    this.state = 'pick';
    this.spinT = 0;
    this.ball = -1;
    this.resultMsg = 'PICK A NUMBER. E TO BET.';
    sfx?.interact?.();
  },

  onExit() {},

  update(dt, input, _dialogue, sfx) {
    if (input.justPressed('Escape') || input.justPressed('KeyQ')) {
      sfx?.cancel?.();
      this.done = true;
      return;
    }

    if (this.state === 'pick') {
      if (input.justPressed('ArrowLeft') || input.justPressed('KeyA')) {
        this.cursor = (this.cursor + 36) % 37;
        sfx?.menuMove?.();
      }
      if (input.justPressed('ArrowRight') || input.justPressed('KeyD')) {
        this.cursor = (this.cursor + 1) % 37;
        sfx?.menuMove?.();
      }
      if (input.justPressed('ArrowUp') || input.justPressed('KeyW')) {
        this.cursor = (this.cursor + 37 - 12) % 37;
        sfx?.menuMove?.();
      }
      if (input.justPressed('ArrowDown') || input.justPressed('KeyS')) {
        this.cursor = (this.cursor + 12) % 37;
        sfx?.menuMove?.();
      }
      if (input.justPressed('KeyE') || input.justPressed('Space')) {
        this.bet = this.cursor;
        this.state = 'spin';
        this.spinT = 0;
        this.ball = -1;
        this.resultMsg = `BET ${this.bet}. WHEEL SPINS.`;
        sfx?.interact?.();
        sfx?.chipDrop?.();
        sfx?.rouletteSpin?.();
      }
    } else if (this.state === 'spin') {
      this.spinT += dt;
      // cycle ball preview
      if (Math.floor(this.spinT * 12) !== Math.floor((this.spinT - dt) * 12)) {
        this.ball = Math.floor(Math.random() * 37);
      }
      if (this.spinT > 1.4) {
        this.ball = Math.floor(Math.random() * 37);
        sfx?.rouletteBall?.();
        if (this.ball === this.bet) {
          this.resultMsg = `BALL ${this.ball}. YOU WIN.`;
          sfx?.win?.();
        } else {
          this.resultMsg = `BALL ${this.ball}. HOUSE TAKES.`;
          sfx?.lose?.();
        }
        this.state = 'result';
      }
    } else if (this.state === 'result') {
      if (input.justPressed('KeyE') || input.justPressed('Space')) {
        this.state = 'pick';
        this.bet = -1;
        this.ball = -1;
        this.resultMsg = 'PICK A NUMBER. E TO BET.';
        sfx?.interact?.();
      }
    }
  },

  render(r, ctx) {
    // Dim world
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 224);

    // Felt panel
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(8, 8, 240, 200);
    ctx.fillStyle = '#bca838';
    ctx.fillRect(8, 8, 240, 2);
    ctx.fillRect(8, 206, 240, 2);
    ctx.fillRect(8, 8, 2, 200);
    ctx.fillRect(246, 8, 2, 200);

    r.text('ROULETTE', 100, 16, '#bca838');

    // 0 cell at left
    const startX = 14, startY = 32;
    const cellW = 16, cellH = 18, gap = 1;
    // 0
    ctx.fillStyle = colorFor(0);
    ctx.fillRect(startX, startY + cellH + gap, cellW, cellH);
    if (this.bet === 0) {
      ctx.fillStyle = '#bca838';
      ctx.fillRect(startX - 1, startY + cellH + gap - 1, cellW + 2, 1);
      ctx.fillRect(startX - 1, startY + cellH + gap + cellH, cellW + 2, 1);
      ctx.fillRect(startX - 1, startY + cellH + gap - 1, 1, cellH + 2);
      ctx.fillRect(startX + cellW, startY + cellH + gap - 1, 1, cellH + 2);
    }
    if (this.cursor === 0) {
      ctx.fillStyle = '#e8e0d0';
      ctx.fillRect(startX - 2, startY + cellH + gap - 2, cellW + 4, 1);
      ctx.fillRect(startX - 2, startY + cellH + gap + cellH + 1, cellW + 4, 1);
      ctx.fillRect(startX - 2, startY + cellH + gap - 2, 1, cellH + 4);
      ctx.fillRect(startX + cellW + 1, startY + cellH + gap - 2, 1, cellH + 4);
    }
    r.text('0', startX + 6, startY + cellH + gap + 5, '#e8e0d0');

    // 1..36 grid: 12 cols x 3 rows
    const gridX = startX + cellW + gap + 6;
    for (let n = 1; n <= 36; n++) {
      const idx = n - 1;
      const col = idx % 12;
      const row = idx < 12 ? 2 : (idx < 24 ? 1 : 0);
      const cx = gridX + col * (cellW + gap);
      const cy = startY + row * (cellH + gap);
      ctx.fillStyle = colorFor(n);
      ctx.fillRect(cx, cy, cellW, cellH);

      // bet outline
      if (this.bet === n) {
        ctx.fillStyle = '#bca838';
        ctx.fillRect(cx - 1, cy - 1, cellW + 2, 1);
        ctx.fillRect(cx - 1, cy + cellH, cellW + 2, 1);
        ctx.fillRect(cx - 1, cy - 1, 1, cellH + 2);
        ctx.fillRect(cx + cellW, cy - 1, 1, cellH + 2);
      }
      // cursor outline (over bet)
      if (this.cursor === n) {
        ctx.fillStyle = '#e8e0d0';
        ctx.fillRect(cx - 2, cy - 2, cellW + 4, 1);
        ctx.fillRect(cx - 2, cy + cellH + 1, cellW + 4, 1);
        ctx.fillRect(cx - 2, cy - 2, 1, cellH + 4);
        ctx.fillRect(cx + cellW + 1, cy - 2, 1, cellH + 4);
      }
      const lbl = String(n);
      const tx = cx + cellW / 2 - lbl.length * 2;
      r.text(lbl, tx, cy + 5, '#e8e0d0');
    }

    // Wheel readout
    const wy = 116;
    ctx.fillStyle = '#000000'; ctx.fillRect(16, wy, 224, 28);
    ctx.fillStyle = '#3c3c5c';
    ctx.fillRect(16, wy, 224, 1);
    ctx.fillRect(16, wy + 27, 224, 1);

    if (this.state === 'spin') {
      r.text(`WHEEL: ${this.ball >= 0 ? this.ball : '--'}`, 24, wy + 10, '#bca838');
    } else if (this.state === 'result') {
      r.text(`WHEEL: ${this.ball}`, 24, wy + 10, '#bca838');
    } else {
      r.text('WHEEL: --', 24, wy + 10, '#bcbcbc');
    }

    r.text(this.resultMsg, 16, 156, '#e8e0d0');

    // Controls + exit
    r.text('ARROWS MOVE   E BET', 16, 188, '#bcbcbc');
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
