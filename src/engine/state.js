export class State {
  constructor(key) {
    this.key = key;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('save load failed', e);
      return null;
    }
  }

  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
      console.warn('save failed', e);
    }
  }

  reset() {
    localStorage.removeItem(this.key);
  }
}
