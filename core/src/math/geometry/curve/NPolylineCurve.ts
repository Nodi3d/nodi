
import { Matrix4, Vector2, Vector3 } from 'three';
import { NMathHelper } from '../../NMathHelper';
import { NBoundingBox } from '../NBoundingBox';
import { NPlane } from '../NPlane';
import { NPoint } from '../NPoint';
import { TransformerType } from '../ITransformable';
import { IClosedCurve } from './IClosedCurve';
import { NCurve } from './NCurve';
import { NNurbsCurve } from './NNurbsCurve';

export class NPolylineCurve extends NCurve implements IClosedCurve {
  protected _points: NPoint[];
  protected _cachedPlane: NPlane | undefined;

  constructor (points: NPoint[] = [], closed: boolean = false) {
    super();
    this._points = points.map((p) => {
      return p.clone();
    });
    this.closed = closed;
  }

  public getCurvePlane (): NPlane {
    return this.estimatePlane();
  }

  public get points (): NPoint[] {
    return this._points.slice();
  }

  getPointAt (t: number): NPoint {
    const points = this.points;
    const p = (this.closed ? points.length : points.length - 1) * t;
    const intPoint = Math.floor(p);
    const weight = p - intPoint;

    const p0 = points[intPoint % points.length];
    let p1;
    if (this.closed) {
      p1 = points[(intPoint + 1) % points.length];
    } else {
      p1 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
    }

    const point = new NPoint().set(
      NMathHelper.lerp(p0.x, p1.x, weight),
      NMathHelper.lerp(p0.y, p1.y, weight),
      NMathHelper.lerp(p0.z, p1.z, weight)
    );

    return point;
  }

  public center (): NPoint {
    const mid = new NPoint();
    this.points.forEach((p) => {
      mid.add(p);
    });
    mid.divideScalar(this.points.length);
    return mid;
  }

  public area (): number {
    const p2d = this.projectPoints();
    let area = 0;
    for (let i = 0, n = p2d.length; i < n; i++) {
      const p0 = p2d[i];
      const p1 = p2d[(i + 1) % n];
      area += (p1.x + p0.x) * (p1.y - p0.y);
    }
    return Math.abs(area / 2.0);
  }

  public contains (point: Vector3): boolean {
    const p = this.project(point);
    const polygon = this.projectPoints();
    const count = polygon.length;

    let inside = false;
    const x = p.x;
    const y = p.y;
    for (let i = 0, j = count - 1; i < count; j = i++) {
      const xi = polygon[i].x; const yi = polygon[i].y;
      const xj = polygon[j].x; const yj = polygon[j].y;
      const intersected = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersected) {
        inside = !inside;
      }
    }

    return inside;
  }

  public projectPoints (): Vector2[] {
    return this.points.map(p => this.project(p));
  }

  public project (point: Vector3): Vector2 {
    const pl = this.estimatePlane();
    return this.projectPointOnPlane(point, pl);
  }

  public estimatePlane (): NPlane {
    if (this._cachedPlane !== undefined) { return this._cachedPlane; }

    const estimated = this.estimatePlaneFromPoints(this.points);
    this._cachedPlane = estimated;
    return estimated;
  }

  protected clearCache (): void {
    this._cachedPlane = undefined;
  }

  public applyMatrix (m: Matrix4): NPolylineCurve {
    const points = this._points.map((p) => {
      return p.clone().applyMatrix4(m);
    });
    return new NPolylineCurve(points, this.closed);
  }

  public transform (f: TransformerType): NPolylineCurve {
    const points = this._points.map((p) => {
      return f(p.clone());
    });
    return new NPolylineCurve(points, this.closed);
  }

  public length (): number {
    let sum = 0;

    for (let i = 0, n = this.points.length - 1; i < n; i++) {
      const p0 = this.points[i];
      const p1 = this.points[i + 1];
      sum += p0.distanceTo(p1);
    }

    if (this.closed && this.points.length > 0) {
      const p0 = this.points[this.points.length - 1];
      const p1 = this.points[0];
      sum += p0.distanceTo(p1);
    }

    return sum;
  }

  public clone (): NPolylineCurve {
    return new NPolylineCurve(this._points, this.closed);
  }

  public flip (): NPolylineCurve {
    const points = this._points.map(p => p.clone());
    return new NPolylineCurve(points.reverse(), this.closed);
  }

  public trim (min: number, max: number): NCurve {
    const nurbs = this.toNurbsCurve();
    const result = nurbs.trim(min, max);
    const points = result.controlPoints().map(p => new NPoint(p.x, p.y, p.z));

    // remove duplicated
    let n = points.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      if (p0.distanceToSquared(p1) < 1e-8) {
        points.splice(i, 1);
        n--;
      }
    }

    let closed = false;
    if (points.length > 0) {
      const p0 = points[0];
      const pl = points[points.length - 1];
      closed = (p0.distanceToSquared(pl) <= 1e-8);
    }
    return new NPolylineCurve(points, closed);
  }

  public bounds (plane: NPlane): NBoundingBox {
    const points = this.points;
    return NBoundingBox.fromPoints(plane, points);
  }

  public toNurbsCurve (): NNurbsCurve {
    const points = this.points;
    if (this.closed && points.length > 0) {
      const first = points[0];
      const last = points[points.length - 1];
      if (first.distanceTo(last) > 1e-10) {
        points.push(first);
      }
    }
    return NNurbsCurve.byPoints(points, 1);
  }

  public toString (): string {
    return 'NPolylineCurve';
  }
}
