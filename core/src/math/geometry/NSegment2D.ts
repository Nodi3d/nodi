import { Vector2 } from 'three';
import { NLine2D } from './NLine2D';

export class NSegment2D {
  x0: number;
  y0: number;
  x1: number;
  y1: number;

  constructor (x0: number, y0: number, x1: number, y1: number) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  getLine (): NLine2D {
    const dx = this.x1 - this.x0;
    const dy = this.y1 - this.y0;
    const a = dy;
    const b = -dx;
    const c = dx * this.y0 - dy * this.x0;
    return new NLine2D(a, b, c);
  }

  length (): number {
    const dx = (this.x0 - this.x1);
    const dy = (this.y0 - this.y1);
    return Math.sqrt(dx * dx + dy * dy);
  }

  getSegmentIntersectionPoint (segment: NSegment2D): { result: boolean, point: Vector2 | null } {
    const l0 = this.getLine();
    const l1 = segment.getLine();
    const ret = segment.intersectsByLine(l0) && this.intersectsByLine(l1);
    if (!ret) {
      return {
        result: ret,
        point: null
      };
    }

    const point = l0.getIntersectionPoint(l1);
    return {
      result: ret && (point !== null),
      point
    };
  }

  intersectsBySegment (segment: NSegment2D): boolean {
    const l0 = this.getLine();
    const l1 = segment.getLine();
    return segment.intersectsByLine(l0) && this.intersectsByLine(l1);
  }

  intersectsByLine (l: NLine2D): boolean {
    const t1 = l.a * this.x0 + l.b * this.y0 + l.c;
    const t2 = l.a * this.x1 + l.b * this.y1 + l.c;
    return t1 * t2 <= 0;
  }
}
