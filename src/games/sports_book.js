// SPORTS BOOK — kiosk skeleton.
// Up/Down: pick sport. Left/Right: pick side. 1-4: stake. E: place bet.
// SFX: menuMove on nav, chipDrop on bet, win/lose on outcome. ESC/Q exits.

const SPORTS = [
  { id: 'NFL',   sides: ['HOME', 'AWAY'] },
  { id: 'NBA',   sides: ['HOME', 'AWAY'] },
  { id: 'MLS',   sides: ['HOME', 'AWAY'] },
  { id: 'HORSE', sides: ['HORSE A', 'HORSE B', 'HORSE C', 'HORSE D'] },
];

const STAKES = [25, 50, 100, 500];

export const sports_book = {
  id: 'sports_book',
  name: 'SPORTS BOOK',
  done: false,

  sportIdx: 0,
  sideIdx: 0,
  stakeIdx: 0,
  state: 'pick',         // 'pick' | 'ticker' | 'result'
  tickerT: 0,
  tickerNoise: 0,
  resultMsg: '',
  pickedSport: '',
  pickedSide: '',
  pickedStake: 0,

  onEnter({ sfx }) {
    this.done = false;
    this.sportIdx = 0;
    this.sideIdx = 0;
    this.stakeIdx = 0;
    this.state = 'pick';
    this.resultMsg = 'PICK SPORT, SIDE, STAKE. E PLACES.';
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
      if (input.justPressed('ArrowUp') || input.justPressed('KeyW')) {
        this.sportIdx = (this.sportIdx + SPORTS.length - 1) % SPORTS.length;
        this.sideIdx = 0;
        sfx?.menuMove?.();
      }
      if (input.justPressed('ArrowDown') || input.justPressed('KeyS')) {
        this.sportIdx = (this.sportIdx + 1) % SPORTS.length;
        this.sideIdx = 0;
        sfx?.menuMove?.();
      }
      const sport = SPORTS[this.sportIdx];
      if (input.justPressed('ArrowLeft') || input.justPressed('KeyA')) {
        this.sideIdx = (this.sideIdx + sport.sides.length - 1) % sport.sides.length;
        sfx?.menuMove?.();
      }
      if (input.justPressed('ArrowRight') || input.justPressed('KeyD')) {
        this.sideIdx = (this.sideIdx + 1) % sport.sides.length;
        sfx?.menuMove?.();
      }
      if (input.justPressed('Digit1')) { this.stakeIdx = 0; sfx?.buttonBlip?.(); }
      if (input.justPressed('Digit2')) { this.stakeIdx = 1; sfx?.buttonBlip?.(); }
      if (input.justPressed('Digit3')) { this.stakeIdx = 2; sfx?.buttonBlip?.(); }
      if (input.justPressed('Digit4')) { this.stakeIdx = 3; sfx?.buttonBlip?.(); }

      if (input.justPressed('KeyE') || input.justPressed('Space')) {
        this.pickedSport = sport.id;
        this.pickedSide = sport.sides[this.sideIdx];
        this.pickedStake = STAKES[this.stakeIdx];
        this.state = 'ticker';
        this.tickerT = 0;
        this.tickerNoise = 0;
        this.resultMsg = `TICKET: ${this.pickedSport} ${this.pickedSide} $${this.pickedStake}.`;
        sfx?.chipDrop?.();
      }
    } else if (this.state === 'ticker') {
      this.tickerT += dt;
      this.tickerNoise += dt;
      // chirp-tick periodically while the wall TVs cycle
      if (Math.floor(this.tickerT * 6) !== Math.floor((this.tickerT - dt) * 6)) {
        sfx?.buttonBlip?.();
      }
      if (this.tickerT > 1.6) {
        // resolve
        const won = Math.random() < 0.5;
        if (won) {
          const payout = this.pickedStake * 2;
          this.resultMsg = `${this.pickedSide} HITS. PAYS $${payout}.`;
          sfx?.win?.();
        } else {
          this.resultMsg = `${this.pickedSide} DOESN'T COVER. -$${this.pickedStake}.`;
          sfx?.lose?.();
        }
        this.state = 'result';
      }
    } else if (this.state === 'result') {
      if (input.justPressed('KeyE') || input.justPressed('Space')) {
        this.state = 'pick';
        this.resultMsg = 'PICK SPORT, SIDE, STAKE. E PLACES.';
        sfx?.interact?.();
      }
    }
  },

  render(r, ctx) {
    // Dim world
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 224);

    // Kiosk panel
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(8, 8, 240, 200);
    ctx.fillStyle = '#bca838';
    ctx.fillRect(8, 8, 240, 2);
    ctx.fillRect(8, 206, 240, 2);
    ctx.fillRect(8, 8, 2, 200);
    ctx.fillRect(246, 8, 2, 200);

    r.text('SPORTS BOOK', 80, 14, '#bca838');

    // Sport list (left column)
    r.text('SPORT', 20, 32, '#bcbcbc');
    for (let i = 0; i < SPORTS.length; i++) {
      const c = (i === this.sportIdx) ? '#bca838' : '#e8e0d0';
      r.text(SPORTS[i].id, 20, 46 + i * 12, c);
    }

    // Side list (middle)
    r.text('SIDE', 96, 32, '#bcbcbc');
    const sport = SPORTS[this.sportIdx];
    for (let i = 0; i < sport.sides.length; i++) {
      const c = (i === this.sideIdx) ? '#bca838' : '#e8e0d0';
      r.text(sport.sides[i], 96, 46 + i * 12, c);
    }

    // Stake (right)
    r.text('STAKE', 184, 32, '#bcbcbc');
    for (let i = 0; i < STAKES.length; i++) {
      const c = (i === this.stakeIdx) ? '#bca838' : '#e8e0d0';
      r.text(`${i + 1} $${STAKES[i]}`, 184, 46 + i * 12, c);
    }

    // Ticker / TV strip
    const tx = 16, ty = 110, tw = 224, th = 18;
    ctx.fillStyle = '#000000'; ctx.fillRect(tx, ty, tw, th);
    ctx.fillStyle = '#3c3c5c';
    ctx.fillRect(tx, ty, tw, 1);
    ctx.fillRect(tx, ty + th - 1, tw, 1);

    if (this.state === 'ticker') {
      // animated dashes scrolling
      const offset = Math.floor(this.tickerT * 60) % 16;
      ctx.fillStyle = '#bca838';
      for (let x = -offset; x < tw; x += 16) {
        ctx.fillRect(tx + x + 4, ty + 7, 8, 4);
      }
      r.text('LIVE', tx + 4, ty + 5, '#a82820');
    } else if (this.state === 'result') {
      r.text(this.resultMsg, tx + 4, ty + 5, '#bca838');
    } else {
      const peek = `${SPORTS[this.sportIdx].id}  ${SPORTS[this.sportIdx].sides[this.sideIdx]}  $${STAKES[this.stakeIdx]}`;
      r.text(peek, tx + 4, ty + 5, '#e8e0d0');
    }

    // Status
    r.text(this.resultMsg, 16, 140, '#e8e0d0');

    // Controls
    r.text('UP/DN SPORT  L/R SIDE  1-4 STAKE', 16, 176, '#bcbcbc');
    r.text('E PLACE BET', 16, 188, '#bcbcbc');
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
