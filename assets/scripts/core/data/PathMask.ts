export default class PathMask {
  private pattern: string[];

  constructor (patternStr: string = '0,2,...') {
    this.pattern = patternStr.split(',');
  }

  private equals (path: string, pattern: string): boolean {
    if (path === pattern) { return true; }

    const a0 = path.split(';');
    const a1 = pattern.split(';');
    if (a0.length !== a1.length) { return false; }

    for (let i = 0; i < a0.length; i++) {
      const p0 = a0[i];
      const p1 = a1[i];
      if (
        p1 !== '*' && // wildcard
        p0 !== p1
      ) {
        return false;
      }
    }

    return true;
  }

  public match (path: string): boolean {
    const n = this.pattern.length;
    for (let i = 0; i < n; i++) {
      const pat = this.pattern[i];
      if (this.equals(path, pat)) { return true; }
    }

    const last = this.pattern[n - 1];

    // sequence test
    if (last === '...' && !path.includes(';') && this.pattern.length > 2) {
      // flat number (ex. {0},{1},{2},...) only
      const found = this.pattern.find(pat => pat.includes(';'));
      if (found !== undefined) { return false; }

      let idx = 0;
      let prev = Number(this.pattern[n - 2]);
      const value = Number(path);
      while (prev < value) {
        const d = Number(this.pattern[idx + 1]) - Number(this.pattern[idx]);
        prev += d;

        if (prev === value) { return true; }
        idx = (idx + 1) % (n - 2);
      }
    }

    return false;
  }
}
