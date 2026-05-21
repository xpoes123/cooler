// Inventory / pause overlay. Tab toggles. While open the scene update is
// paused. Items are scaffolded but empty until the puzzle layer adds collection.
//
// Each item entry: { key, name, blurb, qty? }. The slot icon is looked up
// in PROP_GLYPHS by `key` — those map to (x, y) cells on assets/sprite_sheet.png.

const SLOTS = 20; // 4 rows × 5 cols

// Native (x, y) origin of each prop on the 256×384 sheet — these mirror the
// prop_* entries in src/engine/sprites.js so designers can swap freely.
const PROP_GLYPHS = {
  poker_chip: { x:  32, y: 224 },
  dice:       { x:  64, y: 224 },
  brass_key:  { x:  16, y: 224 },
  keycard:    { x:   0, y: 224 },
  cash:       { x:  48, y: 224 },
  smoke_pack: { x:  80, y: 224 },
  matchbook:  { x:  96, y: 224 },
  martini:    { x: 112, y: 224 },
  whiskey:    { x: 128, y: 224 },
  beer:       { x: 144, y: 224 },
  paper:      { x: 160, y: 224 },
  clipboard:  { x: 176, y: 224 },
  briefcase:  { x: 192, y: 224 },
  phone:      { x: 208, y: 224 },
  camera:     { x: 224, y: 224 },
  keyring:    { x: 240, y: 224 },
  butt:       { x:   0, y: 240 },
  ashtray:    { x:  16, y: 240 },
  badge:      { x:  80, y: 240 },
  newspaper:  { x:  96, y: 240 },
  wallet:     { x: 128, y: 240 },
  lighter:    { x: 144, y: 240 },
  receipt:    { x: 160, y: 240 },
  cassette:   { x: 176, y: 240 },
};

export class Inventory {
  constructor() {
    this.items = [];      // [{ key, name, blurb, qty? }, ...]
    this.selected = 0;
    this.open = false;
    this.objective = { name: 'FIND CALDERONE', notes: [] };

    this.el = document.getElementById('inventory');
    this.gridEl = this.el?.querySelector('.inv-grid');
    this.detailNameEl = this.el?.querySelector('.inv-detail .name');
    this.detailBodyEl = this.el?.querySelector('.inv-detail .blurb');
    this.logBodyEl = this.el?.querySelector('.inv-log .body');

    this._render();
  }

  add(item) {
    if (!item || !item.key) return;
    const existing = this.items.find(i => i.key === item.key);
    if (existing && existing.qty != null) {
      existing.qty += item.qty ?? 1;
    } else {
      this.items.push(item);
    }
    if (this.open) this._render();
  }

  setObjective(name, notes = []) {
    this.objective = { name, notes };
    if (this.open) this._render();
  }

  toggle(sfx) {
    this.open ? this.close(sfx) : this.show(sfx);
  }

  show(sfx) {
    this.open = true;
    if (this.el) this.el.classList.add('active');
    if (sfx) sfx.interact?.();
    this._render();
  }

  close(sfx) {
    this.open = false;
    if (this.el) this.el.classList.remove('active');
    if (sfx) sfx.interact?.();
  }

  // Selection navigation while open. Called from main.js per frame.
  update(input, sfx) {
    if (!this.open) return;
    const slots = this.items.length;
    if (slots === 0) return;
    let moved = false;
    if (input.justPressed('ArrowRight') || input.justPressed('KeyD')) {
      this.selected = (this.selected + 1) % slots;
      moved = true;
    } else if (input.justPressed('ArrowLeft') || input.justPressed('KeyA')) {
      this.selected = (this.selected - 1 + slots) % slots;
      moved = true;
    } else if (input.justPressed('ArrowDown') || input.justPressed('KeyS')) {
      this.selected = Math.min(slots - 1, this.selected + 5);
      moved = true;
    } else if (input.justPressed('ArrowUp') || input.justPressed('KeyW')) {
      this.selected = Math.max(0, this.selected - 5);
      moved = true;
    }
    if (moved) {
      if (sfx) sfx.step?.();
      this._renderDetail();
      this._renderGrid();
    }
  }

  _render() {
    if (!this.el) return;
    this._renderGrid();
    this._renderDetail();
    this._renderLog();
  }

  _renderGrid() {
    if (!this.gridEl) return;
    let html = '';
    for (let i = 0; i < SLOTS; i++) {
      const item = this.items[i];
      const sel = (i === this.selected && item) ? ' sel' : '';
      if (item) {
        const g = PROP_GLYPHS[item.key];
        // Sheet is 256×384 native, displayed in slots at 1.5× = 384×576 background-size.
        const bx = g ? g.x * 1.5 : 0;
        const by = g ? g.y * 1.5 : 0;
        const sprite = g
          ? `<i class="sp" style="background-position:-${bx}px -${by}px"></i>`
          : '';
        const qty = (item.qty != null && item.qty > 1) ? `<span class="qty">${item.qty}</span>` : '';
        html += `<div class="inv-slot${sel}">${sprite}${qty}</div>`;
      } else {
        html += `<div class="inv-slot empty"></div>`;
      }
    }
    this.gridEl.innerHTML = html;
  }

  _renderDetail() {
    if (!this.detailNameEl || !this.detailBodyEl) return;
    const item = this.items[this.selected];
    if (item) {
      this.detailNameEl.textContent = item.name ?? item.key.toUpperCase();
      this.detailBodyEl.textContent = item.blurb ?? '';
    } else {
      this.detailNameEl.textContent = '—';
      this.detailBodyEl.textContent = 'Pockets light. Carpet still loud.';
    }
  }

  _renderLog() {
    if (!this.logBodyEl) return;
    const obj = this.objective ?? { name: '', notes: [] };
    const notes = obj.notes.length
      ? obj.notes.map(n => `<div>&middot; ${n}</div>`).join('')
      : '<div>&middot; Whatever this is, it starts with you out of the back office.</div>';
    this.logBodyEl.innerHTML = `<div class="name">${obj.name}</div>${notes}`;
  }
}
