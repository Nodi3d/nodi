import { ICopyable } from '../../misc/ICopyable';

export class NDomain implements ICopyable {
  start: number;
  end: number;

  constructor (start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  public clone (): NDomain {
    return new NDomain(this.start, this.end);
  }

  public encapsulate (v: number): void {
    this.start = Math.min(v, this.start);
    this.end = Math.max(v, this.end);
  }

  get size (): number {
    return this.end - this.start;
  }

  get min (): number {
    return this.start;
  }

  set min (v: number) {
    this.start = v;
  }

  get max (): number {
    return this.end;
  }

  set max (v: number) {
    this.end = v;
  }

  get center (): number {
    return this.map(0.5);
  }

  public normalize (v: number): number {
    return (v - this.start) / this.size;
  }

  public map (v01: number): number {
    return v01 * this.size + this.start;
  }

  public includes (v: number): boolean {
    return (this.start <= v && v <= this.end);
  }

  public distance (v: number) : number {
    if (v <= this.start) {
      return Math.abs(this.start - v);
    } else if (v >= this.end) {
      return Math.abs(this.end - v);
    }

    return 0;
  }

  public multiply (scalar: number): NDomain {
    return new NDomain(this.start * scalar, this.end * scalar);
  }

  copy (source: NDomain): this {
    this.start = source.start;
    this.end = source.end;
    return this;
  }

  public toString (): string {
    return `NDomain: (${this.start}, ${this.end})`;
  }
}
