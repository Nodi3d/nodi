
import NSegment2D from './NSegment2D';

export default class NBezier {
  p0x: number;
  p0y: number;
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
  p3x: number;
  p3y: number;

  constructor (p0x: number = 0, p0y: number = 0, p1x: number = 0, p1y: number = 0, p2x: number = 0, p2y: number = 0, p3x: number = 0, p3y: number = 0) {
    this.p0x = p0x;
    this.p0y = p0y;
    this.p1x = p1x;
    this.p1y = p1y;
    this.p2x = p2x;
    this.p2y = p2y;
    this.p3x = p3x;
    this.p3y = p3y;
  }

  update (p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number): void {
    this.p0x = p0x;
    this.p0y = p0y;
    this.p1x = p1x;
    this.p1y = p1y;
    this.p2x = p2x;
    this.p2y = p2y;
    this.p3x = p3x;
    this.p3y = p3y;
  }

  build (step = 0.1): NSegment2D[] {
    const points = [];
    const segments = [];

    for (let t = 0; t <= 1.0; t += step) {
      points.push(this.x(t));
      points.push(this.y(t));
    }

    for (let i = 0, n = points.length - 2; i < n; i += 2) {
      const p0x = points[i];
      const p0y = points[i + 1];
      const p1x = points[i + 2];
      const p1y = points[i + 3];
      segments.push(new NSegment2D(p0x, p0y, p1x, p1y));
    }

    return segments;
  }

  x (t: number): number {
    const t1 = 1 - t;
    return t1 * t1 * t1 * this.p0x + 3 * t1 * t1 * t * this.p1x + 3 * t1 * t * t * this.p2x + t * t * t * this.p3x;
  }

  y (t: number): number {
    const t1 = 1 - t;
    return t1 * t1 * t1 * this.p0y + 3 * t1 * t1 * t * this.p1y + 3 * t1 * t * t * this.p2y + t * t * t * this.p3y;
  }
}
