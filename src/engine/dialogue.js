// DOM-overlay dialogue per the design system.
// Lines: string OR { speaker?: string, text: string }
//
// The bone+yellow+black 9-slice chrome lives in CSS. This module just
// drives the text content with a typewriter effect and triggers a small
// SFX blip on each new character.

const CHARS_PER_SEC = 60;

export class Dialogue {
  constructor() {
    this.root = document.getElementById('dialogue');
    this.speakerEl = this.root.querySelector('.speaker');
    this.bodyEl = this.root.querySelector('.body');
    this.arrowEl = this.root.querySelector('.arrow');

    this.active = false;
    this.lines = [];
    this.lineIdx = 0;
    this.charIdx = 0;
    this.elapsed = 0;
    this.sfx = null;
    this._lastBlipChar = -1;
  }

  setSFX(sfx) { this.sfx = sfx; }

  show(lines) {
    const arr = Array.isArray(lines) ? lines : [lines];
    this.lines = arr.map(l => (typeof l === 'string' ? { text: l } : l));
    this.lineIdx = 0;
    this.charIdx = 0;
    this.elapsed = 0;
    this._lastBlipChar = -1;
    this.active = true;
    this.root.classList.add('active');
    this._renderLine();
  }

  close() {
    this.active = false;
    this.root.classList.remove('active');
    this.lines = [];
    this.bodyEl.textContent = '';
    this.speakerEl.textContent = '';
    this.speakerEl.classList.remove('show');
    this.arrowEl.classList.remove('show');
  }

  update(input, dt) {
    if (!this.active) return;
    const text = this.lines[this.lineIdx]?.text ?? '';
    const fullyShown = this.charIdx >= text.length;

    const advance =
      input.justPressed('KeyE') ||
      input.justPressed('Space') ||
      input.justPressed('Enter');

    if (advance) {
      if (!fullyShown) {
        this.charIdx = text.length;
      } else if (this.lineIdx < this.lines.length - 1) {
        this.lineIdx++;
        this.charIdx = 0;
        this.elapsed = 0;
        this._lastBlipChar = -1;
      } else {
        this.close();
        return;
      }
      this._renderLine();
      return;
    }

    if (!fullyShown) {
      this.elapsed += dt;
      const newCharIdx = Math.min(text.length, Math.floor(this.elapsed * CHARS_PER_SEC));
      if (newCharIdx > this.charIdx) {
        this.charIdx = newCharIdx;
        // Blip every 3 chars (avoid flooding)
        if (this.sfx && this.charIdx - this._lastBlipChar >= 3) {
          this.sfx.dialogueChar();
          this._lastBlipChar = this.charIdx;
        }
      }
      this._updateBody();
    }
  }

  _renderLine() {
    const line = this.lines[this.lineIdx];
    if (!line) return;
    if (line.speaker) {
      this.speakerEl.textContent = line.speaker.toUpperCase() + ':';
      this.speakerEl.classList.add('show');
    } else {
      this.speakerEl.classList.remove('show');
    }
    this._updateBody();
  }

  _updateBody() {
    const text = this.lines[this.lineIdx]?.text ?? '';
    this.bodyEl.textContent = text.slice(0, this.charIdx);
    if (this.charIdx >= text.length) {
      this.arrowEl.classList.add('show');
    } else {
      this.arrowEl.classList.remove('show');
    }
  }
}
