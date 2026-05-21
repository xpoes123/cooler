// Central registry for easter-egg triggers.
// Trigger types: keySequence, holdKey, idle, repeat (more later).
//
// Specific eggs are NOT registered here — they live in main.js or per-room
// modules. This is just the bookkeeping engine.

export class Eggs {
  constructor() {
    this.sequences = []; // { id, sequence, idx, onTrigger, repeatable }
    this.holds = [];     // { id, code, seconds, onTrigger, fired }
    this.idleHooks = []; // { id, seconds, onTrigger, fired, accumulated }
    this.fired = new Set();
  }

  // Konami-style key sequence (codes like 'ArrowUp', 'KeyA').
  registerSequence({ id, sequence, onTrigger, repeatable = false }) {
    this.sequences.push({ id, sequence, idx: 0, onTrigger, repeatable });
  }

  // Hold a single key for N seconds.
  registerHold({ id, code, seconds, onTrigger }) {
    this.holds.push({ id, code, seconds, onTrigger, fired: false });
  }

  // Fires when player has been idle (no keys down) for N seconds.
  registerIdle({ id, seconds, onTrigger }) {
    this.idleHooks.push({ id, seconds, onTrigger, fired: false, accumulated: 0 });
  }

  hasFired(id) { return this.fired.has(id); }

  update(input, dt) {
    // Sequences
    for (const code of input.pressed) {
      for (const seq of this.sequences) {
        if (!seq.repeatable && this.fired.has(seq.id)) continue;
        if (seq.sequence[seq.idx] === code) {
          seq.idx++;
          if (seq.idx >= seq.sequence.length) {
            seq.idx = 0;
            this.fired.add(seq.id);
            try { seq.onTrigger(); } catch (e) { console.error(e); }
          }
        } else {
          seq.idx = (seq.sequence[0] === code) ? 1 : 0;
        }
      }
    }

    // Holds
    for (const h of this.holds) {
      if (h.fired) continue;
      if (input.heldSeconds(h.code) >= h.seconds) {
        h.fired = true;
        this.fired.add(h.id);
        try { h.onTrigger(); } catch (e) { console.error(e); }
      }
    }

    // Idle hooks
    const anyDown = input.down.size > 0;
    for (const h of this.idleHooks) {
      if (h.fired) continue;
      if (anyDown) {
        h.accumulated = 0;
      } else {
        h.accumulated += dt;
        if (h.accumulated >= h.seconds) {
          h.fired = true;
          this.fired.add(h.id);
          try { h.onTrigger(); } catch (e) { console.error(e); }
        }
      }
    }
  }
}
