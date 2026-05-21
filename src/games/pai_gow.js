// PAI GOW POKER — set-the-hand skeleton.
// Deal 7 cards in a row at the bottom. Left/Right scrolls cursor.
// E toggles selected card into the HIGH HAND (top row, requires exactly 5).
// SPACE confirms when high=5 + low=2; opponent has fixed 7-card hand.
// Compare via simple high-card eval. ESC/Q exits.

const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUITS = ['S','H','D','C'];

// 4-color suits — all from the design palette, chosen for max distinguishability
// against the bone card face.
const SUIT_COLOR = {
  'S': '#000000', // Spades   — black
  'H': '#a82820', // Hearts   — faded-red
  'D': '#bca838', // Diamonds — sickly-yellow (gold)
  'C': '#3c3c5c', // Clubs    — slate blue
};

function rankValue(r) {
  return RANKS.indexOf(r) + 2; // 2..14
}

function drawCard() {
  return {
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  };
}

// Skeleton "score": sum of highest N cards.
function scoreHand(cards) {
  return cards.map(c => rankValue(c.rank)).sort((a, b) => b - a)
    .reduce((a, v) => a + v, 0);
}

export const pai_gow = {
  id: 'pai_gow',
  name: 'PAI GOW',
  done: false,

  hand: [],            // 7 cards
  high: new Set(),     // indices in hand chosen for high hand
  cursor: 0,
  oppHand: [],
  state: 'set',        // 'set' | 'reveal' | 'result'
  revealT: 0,
  resultMsg: '',

  onEnter({ sfx }) {
    this.done = false;
    this.hand = Array.from({ length: 7 }, drawCard);
    this.oppHand = Array.from({ length: 7 }, drawCard);
    this.high = new Set();
    this.cursor = 0;
    this.state = 'set';
    this.revealT = 0;
    this.resultMsg = 'PICK 5 FOR HIGH HAND.';
    // simulate dealing tick-by-tick on enter
    for (let i = 0; i < 7; i++) sfx?.cardDeal?.();
  },

  onExit() {},

  _confirm(sfx) {
    if (this.high.size !== 5) {
      this.resultMsg = `HIGH NEEDS 5. (${this.high.size})`;
      sfx?.cancel?.();
      return;
    }
    this.state = 'reveal';
    this.revealT = 0;
    this.resultMsg = 'REVEAL';
    sfx?.cardFlip?.();
  },

  _settle(sfx) {
    const myHigh = this.hand.filter((_, i) => this.high.has(i));
    const myLow = this.hand.filter((_, i) => !this.high.has(i));
    // Opponent: top 5 by rank for high, bottom 2 for low.
    const sortedOpp = [...this.oppHand]
      .map((c, i) => ({ c, v: rankValue(c.rank) }))
      .sort((a, b) => b.v - a.v);
    const oppHigh = sortedOpp.slice(0, 5).map(x => x.c);
    const oppLow = sortedOpp.slice(5).map(x => x.c);

    const myHs = scoreHand(myHigh);
    const myLs = scoreHand(myLow);
    const opHs = scoreHand(oppHigh);
    const opLs = scoreHand(oppLow);

    const highWin = myHs > opHs ? 1 : (myHs < opHs ? -1 : 0);
    const lowWin = myLs > opLs ? 1 : (myLs < opLs ? -1 : 0);
    const net = highWin + lowWin;

    if (net > 0) { this.resultMsg = `WIN BOTH. PAYOUT.`; sfx?.win?.(); }
    else if (net < 0) { this.resultMsg = `LOSE BOTH. HOUSE.`; sfx?.lose?.(); }
    else { this.resultMsg = `PUSH.`; }
  },

  update(dt, input, _dialogue, sfx) {
    if (input.justPressed('Escape') || input.justPressed('KeyQ')) {
      sfx?.cancel?.();
      this.done = true;
      return;
    }

    if (this.state === 'set') {
      if (input.justPressed('ArrowLeft') || input.justPressed('KeyA')) {
        this.cursor = (this.cursor + 6) % 7;
        sfx?.menuMove?.();
      }
      if (input.justPressed('ArrowRight') || input.justPressed('KeyD')) {
        this.cursor = (this.cursor + 1) % 7;
        sfx?.menuMove?.();
      }
      if (input.justPressed('KeyE')) {
        if (this.high.has(this.cursor)) {
          this.high.delete(this.cursor);
          sfx?.buttonBlip?.();
        } else if (this.high.size < 5) {
          this.high.add(this.cursor);
          sfx?.cardFlip?.();
        } else {
          sfx?.cancel?.();
        }
      }
      if (input.justPressed('Space')) {
        this._confirm(sfx);
      }
    } else if (this.state === 'reveal') {
      this.revealT += dt;
      if (this.revealT > 0.6) {
        this.state = 'result';
        this._settle(sfx);
      }
    } else if (this.state === 'result') {
      if (input.justPressed('KeyE') || input.justPressed('Space')) {
        // Re-deal
        this.hand = Array.from({ length: 7 }, drawCard);
        this.oppHand = Array.from({ length: 7 }, drawCard);
        this.high = new Set();
        this.cursor = 0;
        this.state = 'set';
        this.resultMsg = 'PICK 5 FOR HIGH HAND.';
        for (let i = 0; i < 7; i++) sfx?.cardDeal?.();
      }
    }
  },

  _drawCard(ctx, x, y, c, w = 22, h = 28) {
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillRect(x + w - 1, y, 1, h);
    const color = SUIT_COLOR[c.suit] ?? '#000000';
    ctx.fillStyle = color;
    ctx.font = '8px monospace';
    ctx.fillText(c.rank, x + 2, y + 2);
    ctx.fillText(c.suit, x + 2, y + 17);
  },

  _drawCardBack(ctx, x, y, w = 22, h = 28) {
    ctx.fillStyle = '#502878';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillRect(x + w - 1, y, 1, h);
    ctx.fillStyle = '#bca838';
    for (let i = 3; i < w; i += 4) ctx.fillRect(x + i, y + 3, 1, h - 6);
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

    r.text('PAI GOW', 100, 14, '#bca838');

    // Opponent row (top): hidden until reveal
    r.text('OPP', 16, 32, '#e8e0d0');
    for (let i = 0; i < 7; i++) {
      const cx = 48 + i * 26;
      const cy = 28;
      if (this.state === 'result') {
        this._drawCard(ctx, cx, cy, this.oppHand[i]);
      } else {
        this._drawCardBack(ctx, cx, cy);
      }
    }

    // High hand area (mid)
    r.text('HIGH', 16, 76, '#bca838');
    let hi = 0;
    for (let i = 0; i < 7; i++) {
      if (!this.high.has(i)) continue;
      const cx = 48 + hi * 26;
      const cy = 72;
      this._drawCard(ctx, cx, cy, this.hand[i]);
      hi++;
    }

    // Hand row (bottom)
    r.text('HAND', 16, 132, '#e8e0d0');
    for (let i = 0; i < 7; i++) {
      const cx = 48 + i * 26;
      const cy = 128;
      if (this.high.has(i)) {
        // shown as gap (still draw outline)
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(cx, cy, 22, 28);
        ctx.fillStyle = '#3c3c5c';
        ctx.fillRect(cx, cy, 22, 1);
        ctx.fillRect(cx, cy + 27, 22, 1);
        ctx.fillRect(cx, cy, 1, 28);
        ctx.fillRect(cx + 21, cy, 1, 28);
      } else {
        this._drawCard(ctx, cx, cy, this.hand[i]);
      }
      // cursor
      if (i === this.cursor && this.state === 'set') {
        ctx.fillStyle = '#bca838';
        ctx.fillRect(cx - 1, cy + 30, 24, 2);
      }
    }

    // Status
    r.text(this.resultMsg, 16, 168, '#e8e0d0');

    // Controls
    r.text('LEFT/RIGHT  E TOGGLE  SPACE OK', 16, 188, '#bcbcbc');
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
