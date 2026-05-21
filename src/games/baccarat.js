// BACCARAT — punto banco skeleton.
// 1 / 2 / 3 select bet on PLAYER / BANKER / TIE.
// E deals: two cards each side, dealt one-at-a-time with cardDeal SFX.
// Hand value = sum mod 10. Highest wins. ESC/Q exits.

const RANKS = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
const SUITS = ['S','H','D','C']; // Spades Hearts Diamonds Clubs

const SUIT_COLOR = {
  'S': '#000000',
  'H': '#a82820',
  'D': '#bca838',
  'C': '#3c3c5c',
};

function cardValue(rank) {
  if (rank === 'A') return 1;
  if (rank === 'T' || rank === 'J' || rank === 'Q' || rank === 'K') return 0;
  return parseInt(rank, 10);
}

function drawCard() {
  return {
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  };
}

export const baccarat = {
  id: 'baccarat',
  name: 'BACCARAT',
  done: false,

  bet: 'PLAYER',          // 'PLAYER' | 'BANKER' | 'TIE'
  state: 'idle',          // 'idle' | 'dealing' | 'reveal' | 'result'
  player: [],
  banker: [],
  dealStep: 0,
  dealT: 0,
  resultMsg: '',

  onEnter({ sfx }) {
    this.done = false;
    this.bet = 'PLAYER';
    this.state = 'idle';
    this.player = [];
    this.banker = [];
    this.dealStep = 0;
    this.dealT = 0;
    this.resultMsg = '1/2/3 PICK BET. E DEAL.';
    sfx?.interact?.();
  },

  onExit() {},

  _handValue(h) {
    return h.reduce((a, c) => a + cardValue(c.rank), 0) % 10;
  },

  _settle(sfx) {
    const p = this._handValue(this.player);
    const b = this._handValue(this.banker);
    let outcome;
    if (p > b) outcome = 'PLAYER';
    else if (b > p) outcome = 'BANKER';
    else outcome = 'TIE';

    const win = outcome === this.bet;
    this.resultMsg = `P:${p} B:${b}. ${outcome} WINS. ${win ? 'YOU CASH.' : 'YOU LOSE.'}`;
    if (win) sfx?.win?.(); else sfx?.lose?.();
  },

  update(dt, input, _dialogue, sfx) {
    if (input.justPressed('Escape') || input.justPressed('KeyQ')) {
      sfx?.cancel?.();
      this.done = true;
      return;
    }

    if (this.state === 'idle' || this.state === 'result') {
      if (input.justPressed('Digit1')) { this.bet = 'PLAYER'; sfx?.menuMove?.(); }
      if (input.justPressed('Digit2')) { this.bet = 'BANKER'; sfx?.menuMove?.(); }
      if (input.justPressed('Digit3')) { this.bet = 'TIE';    sfx?.menuMove?.(); }

      if (input.justPressed('KeyE') || input.justPressed('Space')) {
        this.player = [];
        this.banker = [];
        this.dealStep = 0;
        this.dealT = 0;
        this.state = 'dealing';
        this.resultMsg = 'DEALING';
        sfx?.chipDrop?.();
      }
    } else if (this.state === 'dealing') {
      this.dealT += dt;
      if (this.dealT > 0.35) {
        this.dealT = 0;
        // Order: P, B, P, B
        if (this.dealStep === 0) this.player.push(drawCard());
        else if (this.dealStep === 1) this.banker.push(drawCard());
        else if (this.dealStep === 2) this.player.push(drawCard());
        else if (this.dealStep === 3) this.banker.push(drawCard());
        sfx?.cardDeal?.();
        this.dealStep++;
        if (this.dealStep >= 4) {
          this.state = 'reveal';
          this.dealT = 0;
        }
      }
    } else if (this.state === 'reveal') {
      this.dealT += dt;
      if (this.dealT > 0.4) {
        sfx?.cardFlip?.();
        this.state = 'result';
        this._settle(sfx);
      }
    }
  },

  _drawCard(ctx, x, y, c) {
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(x, y, 24, 32);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 24, 1);
    ctx.fillRect(x, y + 31, 24, 1);
    ctx.fillRect(x, y, 1, 32);
    ctx.fillRect(x + 23, y, 1, 32);

    ctx.fillStyle = SUIT_COLOR[c.suit] ?? '#000000';
    ctx.font = '8px monospace';
    ctx.fillText(c.rank, x + 3, y + 3);
    ctx.fillText(c.suit, x + 3, y + 21);
  },

  _drawCardBack(ctx, x, y) {
    ctx.fillStyle = '#502878';
    ctx.fillRect(x, y, 24, 32);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 24, 1);
    ctx.fillRect(x, y + 31, 24, 1);
    ctx.fillRect(x, y, 1, 32);
    ctx.fillRect(x + 23, y, 1, 32);
    // Crosshatch
    ctx.fillStyle = '#bca838';
    for (let i = 4; i < 24; i += 4) {
      ctx.fillRect(x + i, y + 4, 1, 24);
    }
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

    r.text('BACCARAT', 96, 16, '#bca838');

    // Player row
    r.text('PLAYER', 24, 36, '#e8e0d0');
    for (let i = 0; i < 2; i++) {
      const cx = 80 + i * 30;
      const cy = 32;
      const c = this.player[i];
      if (c) this._drawCard(ctx, cx, cy, c);
      else this._drawCardBack(ctx, cx, cy);
    }
    if (this.state === 'result' || this.state === 'reveal') {
      r.text(`= ${this._handValue(this.player)}`, 156, 44, '#bca838');
    }

    // Banker row
    r.text('BANKER', 24, 84, '#e8e0d0');
    for (let i = 0; i < 2; i++) {
      const cx = 80 + i * 30;
      const cy = 80;
      const c = this.banker[i];
      if (c) this._drawCard(ctx, cx, cy, c);
      else this._drawCardBack(ctx, cx, cy);
    }
    if (this.state === 'result' || this.state === 'reveal') {
      r.text(`= ${this._handValue(this.banker)}`, 156, 92, '#bca838');
    }

    // Bet selector — hotkey shown after the label so it never reads as "Player 1"
    const c1 = this.bet === 'PLAYER' ? '#bca838' : '#bcbcbc';
    const c2 = this.bet === 'BANKER' ? '#bca838' : '#bcbcbc';
    const c3 = this.bet === 'TIE'    ? '#bca838' : '#bcbcbc';
    r.text('BET:', 16, 136, '#e8e0d0');
    r.text('PLAYER (1)', 50, 136, c1);
    r.text('BANKER (2)', 124, 136, c2);
    r.text('TIE (3)',    198, 136, c3);

    // Status
    r.text(this.resultMsg, 16, 160, '#e8e0d0');

    // Controls
    r.text('E DEAL', 16, 188, '#bcbcbc');
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
