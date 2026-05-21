// SLOTS — three-reel skeleton.
// SPACE spins all reels. 1/2/3 stops the corresponding reel.
// Heavy SFX: reelSpin while spinning, reelStop on snap, jackpot on triple match.
// No win state. No outer-game effects. ESC/Q exits.

const SYMBOLS = ['7', 'BAR', '*', 'C', 'S', 'H', 'D'];

// Palette-locked color per symbol (12-color design palette only).
const SYMBOL_COLOR = {
  '7':   '#bca838', // sickly-yellow
  'BAR': '#e8e0d0', // bone
  '*':   '#bca838',
  'C':   '#bcbcbc', // fluoro-bone
  'S':   '#bcbcbc',
  'H':   '#a82820', // faded-red
  'D':   '#a82820',
};

function pickIdx() { return Math.floor(Math.random() * SYMBOLS.length); }

export const slots = {
  id: 'slots',
  name: 'SLOTS',
  done: false,

  // 3 reels: { spinning, idx, t (cycle accumulator), stopAt (target idx when stopping) }
  reels: null,
  resultMsg: '',
  flashT: 0,

  onEnter({ sfx }) {
    this.done = false;
    this.reels = [0, 1, 2].map(() => ({ spinning: false, idx: pickIdx(), t: 0 }));
    this.resultMsg = 'PRESS SPACE TO SPIN';
    this.flashT = 0;
    sfx?.interact?.();
  },

  onExit() {},

  _anySpinning() { return this.reels.some(r => r.spinning); },
  _allStopped() { return this.reels.every(r => !r.spinning); },

  _stopReel(i, sfx) {
    const r = this.reels[i];
    if (!r.spinning) return;
    r.spinning = false;
    r.idx = pickIdx();
    sfx?.reelStop?.();
  },

  _checkResult(sfx) {
    const a = this.reels[0].idx, b = this.reels[1].idx, c = this.reels[2].idx;
    if (a === b && b === c) {
      this.resultMsg = `TRIPLE ${SYMBOLS[a]}. JACKPOT.`;
      this.flashT = 0.9;
      sfx?.jackpot?.();
    } else if (a === b || b === c || a === c) {
      this.resultMsg = 'PAIR. NO PAYOUT.';
    } else {
      this.resultMsg = 'NO MATCH.';
    }
  },

  update(dt, input, _dialogue, sfx) {
    if (input.justPressed('Escape') || input.justPressed('KeyQ')) {
      sfx?.cancel?.();
      this.done = true;
      return;
    }

    if (this.flashT > 0) this.flashT = Math.max(0, this.flashT - dt);

    // Start spin
    if (input.justPressed('Space') && this._allStopped()) {
      for (const r of this.reels) {
        r.spinning = true;
        r.t = 0;
      }
      this.resultMsg = 'SPINNING';
      sfx?.reelSpin?.();
    }

    // Per-reel stop keys
    if (input.justPressed('Digit1')) this._stopReel(0, sfx);
    if (input.justPressed('Digit2')) this._stopReel(1, sfx);
    if (input.justPressed('Digit3')) this._stopReel(2, sfx);

    // Cycle spinning reels
    let didSpinTick = false;
    for (const r of this.reels) {
      if (!r.spinning) continue;
      r.t += dt;
      if (r.t > 0.05) {
        r.t = 0;
        r.idx = (r.idx + 1) % SYMBOLS.length;
        didSpinTick = true;
      }
    }
    if (didSpinTick) {
      // light running noise
      if (Math.random() < 0.3) sfx?.reelSpin?.();
    }

    // Settle when all stopped (after a spin started)
    if (this._allStopped() && this.resultMsg === 'SPINNING') {
      this._checkResult(sfx);
    }
  },

  render(r, ctx) {
    // Dim world
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 224);

    // Cabinet panel
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(24, 20, 208, 160);
    ctx.fillStyle = '#bca838';
    ctx.fillRect(24, 20, 208, 2);
    ctx.fillRect(24, 178, 208, 2);
    ctx.fillRect(24, 20, 2, 160);
    ctx.fillRect(230, 20, 2, 160);

    // Title
    r.text('THE LUCKY PRO  SLOTS', 50, 30, this.flashT > 0 ? '#bca838' : '#e8e0d0');

    // Reel windows
    const ry = 72, rh = 40, rw = 52, gap = 8;
    const totalW = rw * 3 + gap * 2;
    const startX = (256 - totalW) / 2;
    for (let i = 0; i < 3; i++) {
      const rx = startX + i * (rw + gap);
      // window bg
      ctx.fillStyle = '#000000'; ctx.fillRect(rx, ry, rw, rh);
      // reel border
      const reel = this.reels[i];
      const stroke = reel.spinning ? '#a82820' : '#bca838';
      ctx.fillStyle = stroke;
      ctx.fillRect(rx - 2, ry - 2, rw + 4, 2);
      ctx.fillRect(rx - 2, ry + rh, rw + 4, 2);
      ctx.fillRect(rx - 2, ry - 2, 2, rh + 4);
      ctx.fillRect(rx + rw, ry - 2, 2, rh + 4);

      // symbol
      const sym = SYMBOLS[reel.idx];
      const color = SYMBOL_COLOR[sym] ?? '#e8e0d0';
      // Center text approx
      const tx = rx + rw / 2 - (sym.length * 3);
      r.text(sym, tx, ry + rh / 2 - 4, color);

      // reel index label
      r.text(`${i + 1}`, rx + rw / 2 - 2, ry + rh + 6, '#bcbcbc');
    }

    // Status bar
    r.text(this.resultMsg, 36, 138, this.flashT > 0 ? '#bca838' : '#e8e0d0');

    // Controls
    r.text('SPACE SPIN   1/2/3 STOP', 40, 156, '#bcbcbc');

    // Exit hint (bottom-right)
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
