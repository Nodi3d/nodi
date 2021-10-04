import { Matrix4, Vector2, Vector3 } from 'three';
import { NBoundingBox } from '../NBoundingBox';
import { NPlane } from '../NPlane';
import { TransformerType, ITransformable } from '../ITransformable';
import { NPoint } from '../NPoint';
import { NDomain } from '../../primitive/NDomain';
import { NNurbsCurve } from './NNurbsCurve';
import { IBoundable } from '../IBoundable';

export abstract class NCurve implements ITransformable, IBoundable {
  protected _closed: boolean;

  constructor () {
    this._closed = false;
  }

  get closed () {
    return this._closed;
  }

  set closed (v) {
    this._closed = v;
  }

  public abstract getCurvePlane(): NPlane;

  public projectPointOnPlane (point: Vector3, plane: NPlane): Vector2 {
    return plane.project(point);
  }

  public estimatePlaneFromPoints (points: Vector3[]): NPlane {
    const len = points.length;
    if (len >= 3) {
      const a = points[0].clone();
      const b = points[1].clone();
      const c = points[2].clone();

      const ba = (new Vector3()).subVectors(b, a).normalize();
      const cb = (new Vector3()).subVectors(c, b).normalize();
      const normal = (new Vector3()).crossVectors(ba, cb).normalize();

      const dist = a.clone().projectOnPlane(normal).distanceToSquared(a);
      let i = 1;
      for (; i < len; i++) {
        const dist2 = points[i].clone().projectOnPlane(normal).distanceToSquared(points[i]);
        if (Math.abs(dist - dist2) > 1e-10) {
          break;
        }
      }

      // clear test
      if (i === len) {
        const center = new Vector3();
        points.forEach((p) => {
          center.add(p);
        });
        let xAxis = ba;
        const yAxis = (new Vector3()).crossVectors(xAxis, normal).normalize();
        xAxis = (new Vector3()).crossVectors(yAxis, normal).normalize();
        const result = new NPlane(NPoint.fromVector(center.divideScalar(len)), xAxis, yAxis);
        return result;
      }
    }

    throw new Error('Plane can not be defined on a polyline curve');
  }

  public domain (): NDomain {
    return new NDomain(0, 1);
  }

  public abstract getPointAt(t: number): NPoint;
  public getTangentAt (t: number): Vector3 {
    const delta = 0.0001;
    let t1 = t - delta;
    let t2 = t + delta;

    if (t1 < 0) { t1 = 0; }
    if (t2 > 1) { t2 = 1; }

    const pt1 = this.getPointAt(t1);
    const pt2 = this.getPointAt(t2);

    const tangent = new Vector3();
    tangent.copy(pt2).sub(pt1).normalize();
    return tangent;
  }

  public abstract applyMatrix (m: Matrix4): NCurve;
  public abstract transform (f: TransformerType): NCurve;
  public abstract length(): number;
  public abstract flip(): NCurve;
  public abstract trim(min: number, max: number): NCurve;

  public trims (parameters: number[]): NCurve[] {
    const curves = [];
    const epsilon = 1e-10;

    const uf = parameters[0];
    if (uf > epsilon) { // head
      curves.push(this.trim(0, uf));
    }

    for (let i = 0, n = parameters.length - 1; i < n; i++) {
      const u1 = parameters[i];
      const u2 = parameters[i + 1];
      curves.push(this.trim(u1, u2));
    }

    const ul = parameters[parameters.length - 1];
    if (ul < 1 - epsilon) { // end
      curves.push(this.trim(ul, 1));
    }

    return curves;
  }

  public abstract toNurbsCurve(): NNurbsCurve;
  public abstract clone(): NCurve;

  public getPoints (divisions: number): NPoint[] {
    const points: NPoint[] = [];
    for (let i = 0; i <= divisions; i++) {
      const t = i / divisions;
      points.push(this.getPointAt(t));
    }
    return points;
  }

  public abstract bounds (plane: NPlane): NBoundingBox;
  public abstract area(): number;
  public abstract center(): NPoint;

  public toString (): string {
    return 'NCurve';
  }
}
