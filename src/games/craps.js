// CRAPS — two-die come-out skeleton.
// SPACE rolls. A/D (or LEFT/RIGHT) toggles PASS / NO-PASS bet.
// SFX: diceRoll during tumble, diceLand on settle, win/lose on result.
// Skeleton only — no point/box logic, just come-out roll evaluation.
// ESC/Q exits.

function rollDie() { return 1 + Math.floor(Math.random() * 6); }

export const craps = {
  id: 'craps',
  name: 'CRAPS',
  done: false,

  state: 'idle',     // 'idle' | 'rolling' | 'result'
  rollT: 0,
  d1: 1,
  d2: 1,
  bet: 'PASS',       // 'PASS' | 'NO-PASS'
  resultMsg: '',

  onEnter({ sfx }) {
    this.done = false;
    this.state = 'idle';
    this.rollT = 0;
    this.d1 = 1;
    this.d2 = 1;
    this.bet = 'PASS';
    this.resultMsg = 'PRESS SPACE TO ROLL.';
    sfx?.interact?.();
  },

  onExit() {},

  _settle(sfx) {
    const total = this.d1 + this.d2;
    let win = false;
    let outcome;
    // Pass come-out: 7 or 11 win; 2/3/12 lose; else "point" (skeleton: treat as push)
    if (total === 7 || total === 11) outcome = 'PASS';
    else if (total === 2 || total === 3 || total === 12) outcome = 'NO-PASS';
    else outcome = 'POINT';

    if (outcome === 'POINT') {
      this.resultMsg = `${this.d1}+${this.d2}=${total}. POINT. PUSH.`;
    } else {
      win = (outcome === this.bet);
      this.resultMsg = `${this.d1}+${this.d2}=${total}. ${outcome}. ${win ? 'YOU WIN.' : 'HOUSE TAKES.'}`;
      if (win) sfx?.win?.(); else sfx?.lose?.();
    }
  },

  update(dt, input, _dialogue, sfx) {
    if (input.justPressed('Escape') || input.justPressed('KeyQ')) {
      sfx?.cancel?.();
      this.done = true;
      return;
    }

    if (this.state === 'idle' || this.state === 'result') {
      if (
        input.justPressed('KeyA') || input.justPressed('KeyD') ||
        input.justPressed('ArrowLeft') || input.justPressed('ArrowRight')
      ) {
        this.bet = (this.bet === 'PASS') ? 'NO-PASS' : 'PASS';
        sfx?.menuMove?.();
      }
      if (input.justPressed('Space')) {
        this.state = 'rolling';
        this.rollT = 0;
        this.resultMsg = 'ROLLING';
        sfx?.diceRoll?.();
        sfx?.chipDrop?.();
      }
    } else if (this.state === 'rolling') {
      this.rollT += dt;
      // tumble
      if (Math.floor(this.rollT * 14) !== Math.floor((this.rollT - dt) * 14)) {
        this.d1 = rollDie();
        this.d2 = rollDie();
      }
      if (this.rollT > 1.0) {
        this.d1 = rollDie();
        this.d2 = rollDie();
        sfx?.diceLand?.();
        this.state = 'result';
        this._settle(sfx);
      }
    }
  },

  _drawDie(ctx, x, y, n) {
    // Die body
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 32, 1);
    ctx.fillRect(x, y + 31, 32, 1);
    ctx.fillRect(x, y, 1, 32);
    ctx.fillRect(x + 31, y, 1, 32);

    // Pips at fixed positions
    const pip = (px, py) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + px - 2, y + py - 2, 4, 4);
    };
    const TL = [8, 8], TR = [24, 8], ML = [8, 16], MR = [24, 16];
    const BL = [8, 24], BR = [24, 24], C = [16, 16];
    const map = {
      1: [C],
      2: [TL, BR],
      3: [TL, C, BR],
      4: [TL, TR, BL, BR],
      5: [TL, TR, C, BL, BR],
      6: [TL, TR, ML, MR, BL, BR],
    };
    for (const [px, py] of map[n] ?? [C]) pip(px, py);
  },

  render(r, ctx) {
    // Dim world
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 224);

    // Felt
    ctx.fillStyle = '#2c6c6c'; ctx.fillRect(8, 8, 240, 200);
    ctx.fillStyle = '#bca838';
    ctx.fillRect(8, 8, 240, 2);
    ctx.fillRect(8, 206, 240, 2);
    ctx.fillRect(8, 8, 2, 200);
    ctx.fillRect(246, 8, 2, 200);

    r.text('CRAPS', 110, 18, '#bca838');

    // Dice
    const dy = 60;
    this._drawDie(ctx, 80, dy, this.d1);
    this._drawDie(ctx, 144, dy, this.d2);

    // Total readout
    const total = this.d1 + this.d2;
    r.text(`TOTAL ${total}`, 100, 108, '#e8e0d0');

    // Bet selector
    const passColor = this.bet === 'PASS' ? '#bca838' : '#bcbcbc';
    const noPassColor = this.bet === 'NO-PASS' ? '#bca838' : '#bcbcbc';
    r.text('BET:', 24, 140, '#e8e0d0');
    r.text('PASS', 60, 140, passColor);
    r.text('NO-PASS', 100, 140, noPassColor);
    r.text('(A/D SWITCH)', 156, 140, '#3c3c5c');

    // Status
    r.text(this.resultMsg, 16, 168, '#e8e0d0');

    // Controls
    r.text('SPACE ROLL   A/D SWITCH BET', 16, 188, '#bcbcbc');
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
