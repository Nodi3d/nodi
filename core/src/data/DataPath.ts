
export class DataPath {
  indices: number[] = [];
  key: string;

  constructor (arg: any | undefined = undefined) {
    switch (typeof (arg)) {
      case 'number':
        // {n}
        this.indices.push(arg);
        break;
      case 'object':
        // {n:n:n:...}
        this.indices = (arg as number[]).slice();
        break;
      case 'undefined':
        // {0}
        this.indices.push(0);
        break;
    }

    this.key = this.toString();
  }

  increment (idx: number): DataPath {
    const indices = this.indices.slice();
    if (indices.length > 0) {
      indices[indices.length - 1] += idx;
    }
    return new DataPath(indices);
  }

  // Push 1 depth
  append (idx: number): DataPath {
    const source = this.indices.slice();
    source.push(idx);
    return new DataPath(source);
  }

  // Push indices depth
  extend (indices: number[]): DataPath {
    const source = this.indices.slice();
    indices.forEach((idx) => {
      source.push(idx);
    });
    return new DataPath(source);
  }

  // Same depth, next order
  next (): DataPath {
    const indices = this.indices.slice();
    const idx = indices.length - 1;
    indices[idx] = indices[idx] + 1;
    return new DataPath(indices);
  }

  // Same depth, prev order
  prev (): DataPath {
    const indices = this.indices.slice();
    const idx = 0;
    indices[idx] = indices[idx] - 1;
    return new DataPath(indices);
  }

  simplifyHead (): void {
    this.indices.shift(); // remove first element
    this.key = this.toString();
  }

  simplifyTail (): void {
    this.indices.pop(); // remove last element
    this.key = this.toString();
  }

  shift (offset: number = 1): void {
    // remove last element {offset} times
    for (let i = 0; i < offset; i++) {
      this.indices.pop();
    }
    this.key = this.toString();
  }

  getDepth (): number {
    return this.indices.length;
  }

  toString (): string {
    return this.indices.join(';');
  }

  max (other: DataPath): DataPath {
    const il0 = this.indices.length;
    const il1 = other.indices.length;
    if (il0 > il1) {
      return this;
    } else if (il1 > il0) {
      return other;
    }

    const i0 = this.indices[il0 - 1];
    const i1 = other.indices[il1 - 1];
    if (i0 > i1) {
      return this;
    }

    // this & other path is same
    return other;
  }

  equals (other: DataPath): boolean {
    return this.toString() === other.toString();
  }

  compare (other: DataPath): number {
    const l0 = this.indices.length;
    const l1 = other.indices.length;

    let idx = 0;
    while (true) {
      const last0 = l0 <= idx;
      const last1 = l1 <= idx;
      if (last0 && last1) {
        return 0;
      } else if (last0) {
        return -1;
      } else if (last1) {
        return 1;
      }

      if (this.indices[idx] < other.indices[idx]) {
        return -1;
      } else if (this.indices[idx] > other.indices[idx]) {
        return 1;
      }
      idx++;
    }
  }

  clone (): DataPath {
    return new DataPath(this.indices.slice());
  }
}
