
import { Vector2 } from 'three';
import ICopyable from '../../misc/ICopyable';

export default class NComplexNumber implements ICopyable {
  real: number = 0;
  imag: number = 0;

  constructor (real: number = 0, imag: number = 0) {
    this.real = real;
    this.imag = imag;
  }

  public clone (): NComplexNumber {
    return new NComplexNumber(this.real, this.imag);
  }

  public add (other: NComplexNumber): NComplexNumber {
    const a = this.real;
    const b = this.imag;
    const c = other.real;
    const d = other.imag;
    return new NComplexNumber(a + c, b + d);
  }

  public sub (other: NComplexNumber): NComplexNumber {
    const a = this.real;
    const b = this.imag;
    const c = other.real;
    const d = other.imag;
    return new NComplexNumber(a - c, b - d);
  }

  public mul (other: NComplexNumber): NComplexNumber {
    const a = this.real;
    const b = this.imag;
    const c = other.real;
    const d = other.imag;
    return new NComplexNumber(a * c - b * d, b * c + a * d);
  }

  public div (other: NComplexNumber): NComplexNumber {
    const a = this.real;
    const b = this.imag;
    const c = other.real;
    const d = other.imag;
    const real = (a * c + b * d) / (c * c + d * d);
    const imag = (b * c - a * d) / (c * c + d * d);
    return new NComplexNumber(real, imag);
  }

  public abs (): NComplexNumber {
    return new NComplexNumber(Math.abs(this.real), Math.abs(this.imag));
  }

  public conj (): NComplexNumber {
    return new NComplexNumber(this.real, -this.imag);
  }

  public mod (): number {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  public pol (): Vector2 {
    const a = this.real;
    const b = this.imag;
    const z = this.mod();
    const f = Math.atan2(b, a);
    return new Vector2(z, f);
  }

  public rec (): NComplexNumber {
    const z = Math.abs(this.real);
    const f = this.imag;
    const a = z * Math.cos(f);
    const b = z * Math.sin(f);
    return new NComplexNumber(a, b);
  }

  public pow (n: number): NComplexNumber {
    let dest = this.clone();
    for (let i = 1; i < n; i++) {
      dest = dest.mul(this);
    }
    return dest;
  }

  public toString (): string {
    return `NComplexNumber: (${this.real}, ${this.imag})`;
  }

  copy (source: NComplexNumber): this {
    this.real = source.real;
    this.imag = source.imag;
    return this;
  }
}
