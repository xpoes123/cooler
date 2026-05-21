// TEXAS HOLD'EM — heads-up vs NPC.
// Deal: 2 hole cards player + 2 hole cards NPC, then flop (3), turn, river.
// Each street player picks: C call/check, R raise, F fold.
// NPC dummy AI: 85% call, 15% fold; never raises.
// Showdown uses a proper poker hand evaluator (pair/straight/flush/etc).

const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUITS = ['S','H','D','C'];

const SUIT_COLOR = {
  'S': '#000000',
  'H': '#a82820',
  'D': '#bca838',
  'C': '#3c3c5c',
};

const HAND_LABELS = [
  'HIGH CARD', 'PAIR', 'TWO PAIR', 'TRIPS',
  'STRAIGHT', 'FLUSH', 'FULL HOUSE', 'QUADS', 'STRAIGHT FLUSH',
];

function rv(r) { return RANKS.indexOf(r) + 2; }
function makeDeck() {
  const d = [];
  for (const r of RANKS) for (const s of SUITS) d.push({ rank: r, suit: s });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

// Find top of straight given a list of values; returns the high card (or null).
// Handles wheel (A-2-3-4-5).
function _straightTop(values) {
  const uniq = [...new Set(values)].sort((a, b) => b - a);
  if (uniq.includes(14)) uniq.push(1); // wheel
  let count = 1;
  for (let i = 1; i < uniq.length; i++) {
    if (uniq[i] === uniq[i - 1] - 1) {
      count++;
      if (count >= 5) return uniq[i - 4]; // high card of the run
    } else {
      count = 1;
    }
  }
  return null;
}

// Returns a comparable rank tuple [category, ...tiebreakers]. Higher wins.
// Category: 0 high, 1 pair, 2 two-pair, 3 trips, 4 straight, 5 flush,
// 6 full house, 7 quads, 8 straight flush.
function evalBest(cards) {
  if (!cards.length) return [0];
  const values = cards.map(c => rv(c.rank));
  const sortedDesc = [...values].sort((a, b) => b - a);

  // Rank-frequency groups, sorted by (count desc, rank desc).
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  const groups = [...counts.entries()]
    .sort((a, b) => (b[1] - a[1]) || (b[0] - a[0]));

  // Flush detection: any suit with 5+ cards.
  const bySuit = {};
  for (const c of cards) {
    if (!bySuit[c.suit]) bySuit[c.suit] = [];
    bySuit[c.suit].push(rv(c.rank));
  }
  const flushSuit = Object.keys(bySuit).find(s => bySuit[s].length >= 5);
  const flushVals = flushSuit
    ? bySuit[flushSuit].sort((a, b) => b - a).slice(0, 5)
    : null;

  const straightTop = _straightTop(values);
  const straightFlushTop = flushVals ? _straightTop(flushVals) : null;

  if (straightFlushTop) return [8, straightFlushTop];
  if (groups[0][1] === 4) {
    const kicker = sortedDesc.find(v => v !== groups[0][0]) ?? 0;
    return [7, groups[0][0], kicker];
  }
  if (groups[0][1] === 3 && groups[1] && groups[1][1] >= 2) {
    return [6, groups[0][0], groups[1][0]];
  }
  if (flushVals) return [5, ...flushVals];
  if (straightTop) return [4, straightTop];
  if (groups[0][1] === 3) {
    const kickers = sortedDesc.filter(v => v !== groups[0][0]).slice(0, 2);
    return [3, groups[0][0], ...kickers];
  }
  if (groups[0][1] === 2 && groups[1] && groups[1][1] === 2) {
    const kicker = sortedDesc.find(v => v !== groups[0][0] && v !== groups[1][0]) ?? 0;
    return [2, groups[0][0], groups[1][0], kicker];
  }
  if (groups[0][1] === 2) {
    const kickers = sortedDesc.filter(v => v !== groups[0][0]).slice(0, 3);
    return [1, groups[0][0], ...kickers];
  }
  return [0, ...sortedDesc.slice(0, 5)];
}

function compareHands(a, b) {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

export const holdem = {
  id: 'holdem',
  name: "HOLD'EM",
  done: false,

  deck: null,
  player: [],
  npc: [],
  board: [],
  street: 0,           // 0 preflop, 1 flop, 2 turn, 3 river, 4 showdown
  state: 'turn',       // 'turn' | 'npc' | 'next' | 'showdown' | 'folded' | 'over'
  pot: 0,
  msg: '',
  npcT: 0,

  onEnter({ sfx }) {
    this.done = false;
    this._deal(sfx);
  },

  onExit() {},

  _deal(sfx) {
    this.deck = makeDeck();
    this.player = [this.deck.pop(), this.deck.pop()];
    this.npc = [this.deck.pop(), this.deck.pop()];
    this.board = [];
    this.street = 0;
    this.pot = 24; // ante: $12+$12
    this.state = 'turn';
    this.msg = `BLINDS POSTED. POT $${this.pot}.`;
    for (let i = 0; i < 4; i++) sfx?.cardDeal?.();
  },

  _advanceStreet(sfx) {
    if (this.street === 0) {
      this.board.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
      sfx?.cardFlip?.();
      this.street = 1;
      this.msg = 'FLOP.';
    } else if (this.street === 1) {
      this.board.push(this.deck.pop());
      sfx?.cardFlip?.();
      this.street = 2;
      this.msg = 'TURN.';
    } else if (this.street === 2) {
      this.board.push(this.deck.pop());
      sfx?.cardFlip?.();
      this.street = 3;
      this.msg = 'RIVER.';
    } else if (this.street === 3) {
      this._showdown(sfx);
      return;
    }
    this.state = 'turn';
  },

  _showdown(sfx) {
    const me = evalBest([...this.player, ...this.board]);
    const them = evalBest([...this.npc, ...this.board]);
    const meLabel = HAND_LABELS[me[0]];
    const themLabel = HAND_LABELS[them[0]];
    const cmp = compareHands(me, them);
    if (cmp > 0) {
      this.msg = `${meLabel} BEATS ${themLabel}. YOU TAKE $${this.pot}.`;
      sfx?.win?.();
    } else if (cmp < 0) {
      this.msg = `${themLabel} BEATS ${meLabel}. NPC TAKES $${this.pot}.`;
      sfx?.lose?.();
    } else {
      this.msg = `BOTH ${meLabel}. CHOP.`;
    }
    this.street = 4;
    this.state = 'over';
  },

  _playerAction(act, sfx) {
    if (act === 'F') {
      this.msg = `YOU FOLD. NPC TAKES $${this.pot}.`;
      this.state = 'over';
      sfx?.cancel?.();
      return;
    }
    if (act === 'C') {
      this.pot += 12;
      sfx?.chipDrop?.();
      this.state = 'npc';
      this.npcT = 0;
      return;
    }
    if (act === 'R') {
      this.pot += 24;
      sfx?.chipDrop?.();
      sfx?.chipDrop?.();
      this.state = 'npc';
      this.npcT = 0;
      return;
    }
  },

  _npcAct(sfx) {
    // 80% call, 20% fold on raise turns; skeleton-AI.
    const r = Math.random();
    if (r < 0.85) {
      this.pot += 12;
      sfx?.chipDrop?.();
      this.msg = `NPC CALLS. POT $${this.pot}.`;
      this.state = 'next';
    } else {
      this.msg = `NPC FOLDS. YOU TAKE $${this.pot}.`;
      this.state = 'over';
      sfx?.win?.();
    }
  },

  update(dt, input, _dialogue, sfx) {
    if (input.justPressed('Escape') || input.justPressed('KeyQ')) {
      sfx?.cancel?.();
      this.done = true;
      return;
    }

    if (this.state === 'turn') {
      if (input.justPressed('KeyC')) this._playerAction('C', sfx);
      else if (input.justPressed('KeyR')) this._playerAction('R', sfx);
      else if (input.justPressed('KeyF')) this._playerAction('F', sfx);
    } else if (this.state === 'npc') {
      this.npcT += dt;
      if (this.npcT > 0.6) {
        this._npcAct(sfx);
      }
    } else if (this.state === 'next') {
      // small pause, then deal next street
      this.npcT += dt;
      if (this.npcT > 0.5) {
        this.npcT = 0;
        this._advanceStreet(sfx);
      }
    } else if (this.state === 'over') {
      if (input.justPressed('Space') || input.justPressed('KeyE')) {
        this._deal(sfx);
      }
    }
  },

  _drawCard(ctx, x, y, c, w = 22, h = 30) {
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillRect(x + w - 1, y, 1, h);
    ctx.fillStyle = SUIT_COLOR[c.suit] ?? '#000000';
    ctx.font = '8px monospace';
    ctx.fillText(c.rank, x + 2, y + 2);
    ctx.fillText(c.suit, x + 2, y + 19);
  },

  _drawCardBack(ctx, x, y, w = 22, h = 30) {
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

    r.text("HEADS-UP HOLD'EM", 64, 14, '#bca838');

    // NPC
    r.text('NPC', 16, 34, '#e8e0d0');
    for (let i = 0; i < 2; i++) {
      const cx = 48 + i * 26;
      const cy = 30;
      if (this.state === 'over' && this.street >= 1 && this.npc[i]) {
        this._drawCard(ctx, cx, cy, this.npc[i]);
      } else {
        this._drawCardBack(ctx, cx, cy);
      }
    }

    // Board (5 cards)
    r.text('BOARD', 16, 78, '#bca838');
    for (let i = 0; i < 5; i++) {
      const cx = 56 + i * 28;
      const cy = 74;
      if (this.board[i]) {
        this._drawCard(ctx, cx, cy, this.board[i]);
      } else {
        // empty slot
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(cx, cy, 22, 30);
        ctx.fillStyle = '#3c3c5c';
        ctx.fillRect(cx, cy, 22, 1);
        ctx.fillRect(cx, cy + 29, 22, 1);
        ctx.fillRect(cx, cy, 1, 30);
        ctx.fillRect(cx + 21, cy, 1, 30);
      }
    }

    // Player
    r.text('YOU', 16, 124, '#e8e0d0');
    for (let i = 0; i < 2; i++) {
      const cx = 48 + i * 26;
      const cy = 120;
      if (this.player[i]) this._drawCard(ctx, cx, cy, this.player[i]);
      else this._drawCardBack(ctx, cx, cy);
    }

    // Pot + street
    r.text(`POT $${this.pot}`, 156, 124, '#bca838');
    const streetName = ['PRE','FLOP','TURN','RIVER','SHOW'][this.street] ?? '';
    r.text(`STREET ${streetName}`, 156, 136, '#bcbcbc');

    // Status
    r.text(this.msg, 16, 162, '#e8e0d0');

    // Controls
    if (this.state === 'turn') {
      r.text('C CALL  R RAISE  F FOLD', 16, 188, '#bca838');
    } else if (this.state === 'over') {
      r.text('SPACE NEXT HAND', 16, 188, '#bca838');
    } else {
      r.text('NPC THINKING', 16, 188, '#bcbcbc');
    }
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
