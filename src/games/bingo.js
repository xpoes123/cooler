// BINGO — 5x5 grid skeleton.
// B calls a new ball (1-75). Arrows + E mark the focused cell.
// Auto-detect bingo on rows/cols/diagonals. ESC/Q exits.

function makeCard() {
  // Standard bingo: cols B(1-15) I(16-30) N(31-45) G(46-60) O(61-75)
  const cols = [];
  for (let c = 0; c < 5; c++) {
    const lo = 1 + c * 15;
    const pool = [];
    for (let i = 0; i < 15; i++) pool.push(lo + i);
    // pick 5
    const out = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    cols.push(out);
  }
  // grid[row][col]
  const grid = [];
  for (let row = 0; row < 5; row++) {
    const r = [];
    for (let col = 0; col < 5; col++) r.push(cols[col][row]);
    grid.push(r);
  }
  // free space
  grid[2][2] = 0;
  return grid;
}

function checkBingo(marks) {
  // marks: 5x5 boolean
  // rows
  for (let r = 0; r < 5; r++) if (marks[r].every(Boolean)) return true;
  // cols
  for (let c = 0; c < 5; c++) {
    let ok = true;
    for (let r = 0; r < 5; r++) if (!marks[r][c]) { ok = false; break; }
    if (ok) return true;
  }
  // diagonals
  let d1 = true, d2 = true;
  for (let i = 0; i < 5; i++) {
    if (!marks[i][i]) d1 = false;
    if (!marks[i][4 - i]) d2 = false;
  }
  return d1 || d2;
}

export const bingo = {
  id: 'bingo',
  name: 'BINGO',
  done: false,

  grid: null,
  marks: null,
  called: null,            // Set of called numbers
  lastCall: -1,
  cursor: { x: 0, y: 0 },
  msg: '',
  bingoT: 0,

  onEnter({ sfx }) {
    this.done = false;
    this.grid = makeCard();
    this.marks = Array.from({ length: 5 }, () => Array(5).fill(false));
    this.marks[2][2] = true; // free
    this.called = new Set();
    this.lastCall = -1;
    this.cursor = { x: 0, y: 0 };
    this.msg = 'B CALL. ARROWS+E MARK.';
    this.bingoT = 0;
    sfx?.interact?.();
  },

  onExit() {},

  _call(sfx) {
    if (this.called.size >= 75) return;
    let n;
    do { n = 1 + Math.floor(Math.random() * 75); } while (this.called.has(n));
    this.called.add(n);
    this.lastCall = n;
    sfx?.bingoCall?.();
    const colLetter = 'BINGO'[Math.floor((n - 1) / 15)];
    this.msg = `CALL: ${colLetter}-${n}`;
  },

  _mark(sfx) {
    const { x, y } = this.cursor;
    const v = this.grid[y][x];
    if (v === 0) return; // free
    if (!this.called.has(v)) {
      this.msg = `${v} NOT CALLED.`;
      sfx?.cancel?.();
      return;
    }
    this.marks[y][x] = !this.marks[y][x];
    sfx?.bingoMark?.();
    if (checkBingo(this.marks)) {
      this.msg = 'BINGO. PAYS HOUSE-EDGE.';
      this.bingoT = 1.0;
      sfx?.win?.();
    }
  },

  update(dt, input, _dialogue, sfx) {
    if (input.justPressed('Escape') || input.justPressed('KeyQ')) {
      sfx?.cancel?.();
      this.done = true;
      return;
    }

    if (this.bingoT > 0) this.bingoT = Math.max(0, this.bingoT - dt);

    if (input.justPressed('ArrowLeft') || input.justPressed('KeyA')) {
      this.cursor.x = (this.cursor.x + 4) % 5;
      sfx?.menuMove?.();
    }
    if (input.justPressed('ArrowRight') || input.justPressed('KeyD')) {
      this.cursor.x = (this.cursor.x + 1) % 5;
      sfx?.menuMove?.();
    }
    if (input.justPressed('ArrowUp') || input.justPressed('KeyW')) {
      this.cursor.y = (this.cursor.y + 4) % 5;
      sfx?.menuMove?.();
    }
    if (input.justPressed('ArrowDown') || input.justPressed('KeyS')) {
      this.cursor.y = (this.cursor.y + 1) % 5;
      sfx?.menuMove?.();
    }
    if (input.justPressed('KeyB')) this._call(sfx);
    if (input.justPressed('KeyE') || input.justPressed('Space')) this._mark(sfx);
  },

  render(r, ctx) {
    // Dim world
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 224);

    // Hall panel
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(8, 8, 240, 200);
    ctx.fillStyle = '#bca838';
    ctx.fillRect(8, 8, 240, 2);
    ctx.fillRect(8, 206, 240, 2);
    ctx.fillRect(8, 8, 2, 200);
    ctx.fillRect(246, 8, 2, 200);

    r.text('BINGO HALL', 88, 14, '#bca838');

    // Caller display: big number
    ctx.fillStyle = '#000000'; ctx.fillRect(16, 28, 64, 48);
    ctx.fillStyle = '#a82820';
    ctx.fillRect(16, 28, 64, 1);
    ctx.fillRect(16, 75, 64, 1);
    ctx.fillRect(16, 28, 1, 48);
    ctx.fillRect(79, 28, 1, 48);
    if (this.lastCall > 0) {
      const colLetter = 'BINGO'[Math.floor((this.lastCall - 1) / 15)];
      r.text(colLetter, 42, 36, '#bca838');
      r.text(String(this.lastCall), 38, 56, '#e8e0d0');
    } else {
      r.text('--', 42, 50, '#3c3c5c');
    }

    // Card grid 5x5
    const gridX = 100, gridY = 28;
    const cell = 22, gap = 2;
    // Header row B I N G O
    for (let c = 0; c < 5; c++) {
      const cx = gridX + c * (cell + gap);
      r.text('BINGO'[c], cx + cell / 2 - 2, gridY - 10, '#bca838');
    }
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const cx = gridX + col * (cell + gap);
        const cy = gridY + row * (cell + gap);
        const v = this.grid[row][col];
        const marked = this.marks[row][col];
        ctx.fillStyle = marked ? '#502878' : '#3c3c5c';
        ctx.fillRect(cx, cy, cell, cell);
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx, cy, cell, 1);
        ctx.fillRect(cx, cy + cell - 1, cell, 1);
        ctx.fillRect(cx, cy, 1, cell);
        ctx.fillRect(cx + cell - 1, cy, 1, cell);

        // text
        if (v === 0) {
          r.text('FREE', cx + 2, cy + 8, '#bca838');
        } else {
          const s = String(v);
          r.text(s, cx + cell / 2 - s.length * 2, cy + 8, marked ? '#e8e0d0' : '#bcbcbc');
        }
        // cursor
        if (this.cursor.x === col && this.cursor.y === row) {
          ctx.fillStyle = this.bingoT > 0 ? '#bca838' : '#e8e0d0';
          ctx.fillRect(cx - 1, cy - 1, cell + 2, 1);
          ctx.fillRect(cx - 1, cy + cell, cell + 2, 1);
          ctx.fillRect(cx - 1, cy - 1, 1, cell + 2);
          ctx.fillRect(cx + cell, cy - 1, 1, cell + 2);
        }
      }
    }

    // Status
    r.text(this.msg, 16, 168, this.bingoT > 0 ? '#bca838' : '#e8e0d0');
    r.text(`CALLED ${this.called.size}/75`, 16, 180, '#bcbcbc');

    // Controls
    r.text('B CALL  ARROWS  E MARK', 16, 196, '#bcbcbc');
    r.text('ESC EXIT', 196, 212, '#bca838');
  },
};
