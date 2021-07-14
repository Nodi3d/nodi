
import { Vector2 } from 'three';

export default class NLine2D {
  a: number;
  b: number;
  c: number;

  constructor (a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  getIntersectionPoint (l: NLine2D): Vector2 | null {
    const d = this.a * l.b - l.a * this.b;
    if (d === 0.0) {
      return null;
    }

    const x = (this.b * l.c - l.b * this.c) / d;
    const y = (l.a * this.c - this.a * l.c) / d;
    return new Vector2(x, y);
  }
}
