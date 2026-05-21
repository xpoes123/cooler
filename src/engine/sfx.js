// Procedural sound effects via Web Audio (sfxr-style, no audio files).
// Shares the AudioContext + master gain with the music so M mutes both.
// All methods are no-ops until attach() is called from a user gesture.

export class SFX {
  constructor() {
    this.ctx = null;
    this.master = null;
  }

  attach(ctx, masterGain) {
    if (this.ctx) return;
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(masterGain);
  }

  // ---------- internal primitives ----------

  _now() { return this.ctx?.currentTime ?? 0; }

  _osc({ type = 'square', freq, freqEnd, when, dur, gain = 0.2 }) {
    if (!this.ctx) return;
    const t = when ?? this._now();
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) {
      try { osc.frequency.exponentialRampToValueAtTime(Math.max(0.0001, freqEnd), t + dur); }
      catch (_) { osc.frequency.linearRampToValueAtTime(freqEnd, t + dur); }
    }
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  _noise({ when, dur, gain = 0.18, lowpass = 1200, highpass = 0 }) {
    if (!this.ctx) return;
    const t = when ?? this._now();
    const samples = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, samples, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    let node = src;
    if (lowpass) {
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = lowpass;
      node.connect(lp);
      node = lp;
    }
    if (highpass) {
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = highpass;
      node.connect(hp);
      node = hp;
    }
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g).connect(this.master);
    src.start(t);
  }

  // ---------- world / movement ----------

  step()        { this._osc({ type: 'square', freq: 110, freqEnd: 70, dur: 0.045, gain: 0.07 }); }
  bumpWall()    { this._osc({ type: 'square', freq: 90,  freqEnd: 50, dur: 0.06,  gain: 0.10 }); }

  // ---------- interactions ----------

  interact()    { this._osc({ type: 'square', freq: 880, freqEnd: 1320, dur: 0.04, gain: 0.14 }); }
  cancel()      { this._osc({ type: 'square', freq: 660, freqEnd: 220,  dur: 0.08, gain: 0.14 }); }
  buttonBlip()  { this._osc({ type: 'square', freq: 660, dur: 0.025, gain: 0.10 }); }
  menuMove()    { this._osc({ type: 'square', freq: 440, dur: 0.025, gain: 0.08 }); }
  pickup()      { this._osc({ type: 'square', freq: 880, freqEnd: 1760, dur: 0.10, gain: 0.16 }); }

  // ---------- dialogue ----------

  dialogueChar() { this._osc({ type: 'square', freq: 1400, dur: 0.012, gain: 0.04 }); }

  // ---------- doors ----------

  doorOpen()    {
    this._osc({ type: 'sawtooth', freq: 220, freqEnd: 110, dur: 0.20, gain: 0.18 });
    this._noise({ dur: 0.15, gain: 0.10, lowpass: 800 });
  }
  doorLocked()  {
    this._osc({ type: 'square', freq: 200, dur: 0.05, gain: 0.16 });
    this._osc({ type: 'square', freq: 200, when: this._now() + 0.07, dur: 0.05, gain: 0.16 });
  }

  // ---------- casino game sounds ----------

  reelStop()    { this._osc({ type: 'square', freq: 700, freqEnd: 220, dur: 0.08, gain: 0.18 }); }
  reelSpin()    { this._noise({ dur: 0.05, gain: 0.08, lowpass: 3000, highpass: 800 }); }
  jackpot()     {
    const notes = [523, 659, 784, 1047, 1318];
    notes.forEach((f, i) => this._osc({ type: 'square', freq: f, when: this._now() + i * 0.08, dur: 0.18, gain: 0.18 }));
  }
  chipDrop()    { this._osc({ type: 'square', freq: 1500, freqEnd: 700, dur: 0.05, gain: 0.14 }); }
  cardFlip()    { this._noise({ dur: 0.04, gain: 0.16, lowpass: 4500, highpass: 1500 }); }
  cardDeal()    {
    this._noise({ dur: 0.03, gain: 0.12, lowpass: 4000, highpass: 2000 });
    this._osc({ type: 'square', freq: 1200, when: this._now() + 0.02, dur: 0.02, gain: 0.04 });
  }
  diceRoll()    {
    for (let i = 0; i < 6; i++) {
      this._noise({ when: this._now() + i * 0.035, dur: 0.04, gain: 0.10, lowpass: 2200, highpass: 200 });
    }
  }
  diceLand()    { this._noise({ dur: 0.06, gain: 0.18, lowpass: 1500 }); }
  rouletteSpin(){ this._noise({ dur: 0.6, gain: 0.07, lowpass: 1500, highpass: 600 }); }
  rouletteBall(){ this._osc({ type: 'square', freq: 1800, freqEnd: 600, dur: 0.05, gain: 0.10 }); }
  bingoCall()   { this._osc({ type: 'square', freq: 523, dur: 0.18, gain: 0.16 }); }
  bingoMark()   { this._osc({ type: 'square', freq: 988, dur: 0.06, gain: 0.14 }); }

  // ---------- game outcomes ----------

  win()         {
    const notes = [392, 523, 659, 784];
    notes.forEach((f, i) => this._osc({ type: 'triangle', freq: f, when: this._now() + i * 0.07, dur: 0.18, gain: 0.18 }));
  }
  lose()        {
    const notes = [392, 311, 247];
    notes.forEach((f, i) => this._osc({ type: 'triangle', freq: f, when: this._now() + i * 0.10, dur: 0.20, gain: 0.16 }));
  }

  // ---------- danger ----------

  alarm()       {
    for (let i = 0; i < 4; i++) {
      this._osc({ type: 'sawtooth', freq: 800, freqEnd: 500, when: this._now() + i * 0.18, dur: 0.14, gain: 0.20 });
    }
  }
  caught()      {
    this._osc({ type: 'square', freq: 220, freqEnd: 80, dur: 0.5, gain: 0.22 });
    this._noise({ dur: 0.3, gain: 0.12, lowpass: 600 });
  }
}
