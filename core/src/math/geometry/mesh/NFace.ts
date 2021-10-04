import { Vector3 } from 'three';

export class NFace {
  private _a: number;
  private _b: number;
  private _c: number;
  private _normal?: Vector3;

  constructor (a: number, b: number, c: number, normal?: Vector3) {
    this._a = a;
    this._b = b;
    this._c = c;
    this._normal = normal;
  }

  public get a (): number {
    return this._a;
  }

  public get b (): number {
    return this._b;
  }

  public get c (): number {
    return this._c;
  }

  public get normal (): Vector3 | undefined {
    return this._normal;
  }

  public flip (): NFace {
    return new NFace(this.c, this.b, this.a, this._normal?.clone().multiplyScalar(-1));
  }

  public toArray (): number[] {
    return [this.a, this.b, this.c];
  }

  public clone (): NFace {
    return new NFace(this.a, this.b, this.c, this._normal?.clone());
  }

  public toString (): string {
    return `NFace (${this.a}, ${this.b}, ${this.c})`;
  }
}
