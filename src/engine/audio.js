// Tiny chiptune loop — NES-style square + triangle, scheduled via Web Audio.
// Designed to be casino-noir background atmosphere, not foreground melody:
// minor-key walking bass, sparse stab notes, slow tempo.
//
// Browser autoplay policy: AudioContext can only start from a user gesture.
// Caller must invoke start() from within a key/click handler.

const NOTES = {
  D2:  73.42,  E2:  82.41,  F2:  87.31,  G2:  98.00,  A2: 110.00, Bb2: 116.54,
  C3: 130.81,  D3: 146.83,  F3: 174.61,  G3: 196.00,  A3: 220.00,
  D4: 293.66,  F4: 349.23,  G4: 392.00,  A4: 440.00,  C5: 523.25,
  D5: 587.33,  F5: 698.46,  G5: 783.99,  A5: 880.00,
};

// 16-step pattern at 8th-note resolution. Slow walking Dm with sparse 7th-chord stabs.
const BPM = 84;
const STEP_SEC = 60 / BPM / 2;

const PATTERN = [
  /*  1 */ { bass: 'D2',  lead: 'F4'  },
  /*  2 */ { bass: null,  lead: null  },
  /*  3 */ { bass: 'A2',  lead: null  },
  /*  4 */ { bass: null,  lead: 'A4'  },
  /*  5 */ { bass: 'F2',  lead: null  },
  /*  6 */ { bass: null,  lead: null  },
  /*  7 */ { bass: 'G2',  lead: 'D5'  },
  /*  8 */ { bass: 'A2',  lead: null  },
  /*  9 */ { bass: 'D2',  lead: 'C5'  },
  /* 10 */ { bass: null,  lead: null  },
  /* 11 */ { bass: 'F2',  lead: null  },
  /* 12 */ { bass: null,  lead: 'A4'  },
  /* 13 */ { bass: 'Bb2', lead: null  },
  /* 14 */ { bass: null,  lead: 'F4'  },
  /* 15 */ { bass: 'A2',  lead: null  },
  /* 16 */ { bass: null,  lead: null  },
];

const MASTER_GAIN = 0.16;     // overall volume — kept low (atmosphere, not foreground)
const LOOK_AHEAD = 0.12;      // schedule 120ms ahead
const SCHEDULE_INTERVAL = 25; // ms between scheduler ticks

export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.started = false;
    this.noteIdx = 0;
    this.nextNoteTime = 0;
    this._timer = null;
    this.onMuteChange = null; // optional callback (muted: boolean) => void
  }

  start() {
    if (this.started) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = MASTER_GAIN;
    this.master.connect(this.ctx.destination);
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.started = true;
    this._tick();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) {
      const target = this.muted ? 0 : MASTER_GAIN;
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.08);
    }
    if (typeof this.onMuteChange === 'function') this.onMuteChange(this.muted);
    return this.muted;
  }

  _playNote(freq, when, dur, gain, type = 'square') {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(g).connect(this.master);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  _tick() {
    if (!this.started) return;
    while (this.nextNoteTime < this.ctx.currentTime + LOOK_AHEAD) {
      const step = PATTERN[this.noteIdx];
      if (step.bass) {
        this._playNote(NOTES[step.bass], this.nextNoteTime, STEP_SEC * 1.9, 0.55, 'square');
      }
      if (step.lead) {
        this._playNote(NOTES[step.lead], this.nextNoteTime, STEP_SEC * 1.6, 0.28, 'triangle');
      }
      this.nextNoteTime += STEP_SEC;
      this.noteIdx = (this.noteIdx + 1) % PATTERN.length;
    }
    this._timer = setTimeout(() => this._tick(), SCHEDULE_INTERVAL);
  }
}
