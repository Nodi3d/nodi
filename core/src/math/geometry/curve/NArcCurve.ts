
import { Matrix4, Vector3 } from 'three';
import verb from '../../../lib/verb/verb';
import { NPlane } from '../NPlane';
import { TWO_PI } from '../../Constant';
import { NPoint } from '../NPoint';
import { TransformerType } from '../ITransformable';
import { NPlaneCurve } from './NPlaneCurve';
import { NNurbsCurve } from './NNurbsCurve';
import { NEllipseArcCurve } from './NEllipseArcCurve';
import { NCurve } from './NCurve';

export class NArcCurve extends NPlaneCurve {
  private startAngle: number;
  private endAngle: number;
  private angle: number;
  protected radius: number;

  constructor (plane = new NPlane(), start = 0, end = Math.PI * 2, radius = 1) {
    let len = end - start;
    if (end < start) {
      len = Math.PI * 2 - Math.abs(len);
    }

    super(plane);
    this.startAngle = start;
    this.endAngle = end;
    this.angle = len;
    this.radius = radius;
  }

  public getRadius (): number {
    return this.radius;
  }

  public area (): number {
    const r = Math.abs(this.endAngle - this.startAngle) / TWO_PI;
    return this.radius * this.radius * Math.PI * r;
  }

  public center (): NPoint {
    throw new Error('Not implemented');
  }

  length (): number {
    const angle = Math.abs(this.endAngle - this.startAngle);
    return this.radius * TWO_PI * (angle / TWO_PI);
  }

  public getPointAt (t: number): NPoint {
    const r = this.startAngle + t * this.angle;
    const x = Math.cos(r) * this.radius;
    const y = Math.sin(r) * this.radius;
    const p = this.plane.origin.clone();
    p.add(this.plane.xAxis.clone().multiplyScalar(x));
    p.add(this.plane.yAxis.clone().multiplyScalar(y));
    return p;
  }

  trim (min: number, max: number): NArcCurve {
    const interval = this.endAngle - this.startAngle;
    const start = interval * min + this.startAngle;
    const end = interval * max + this.startAngle;
    return new NArcCurve(this.plane, start, end, this.radius);
  }

  transform (f: TransformerType): NCurve {
    const plane = this.plane.transform(f);

    const origin = f(this.plane.origin.clone());
    const px = f(this.plane.origin.clone().add(this.plane.xAxis));
    const py = f(this.plane.origin.clone().add(this.plane.yAxis));
    const sx = px.distanceTo(origin);
    const sy = py.distanceTo(origin);
    if (sx === sy) {
      // U scale
      return new NArcCurve(plane, this.startAngle, this.endAngle, this.radius * sx);
    } else {
      // NU scale
      return new NEllipseArcCurve(plane, this.startAngle, this.endAngle, this.radius * sx, this.radius * sy);
    }
  }

  applyMatrix (m: Matrix4): NCurve {
    const plane = this.plane.applyMatrix(m);

    const origin = this.plane.origin.clone().applyMatrix4(m);
    const px = this.plane.origin.clone().add(this.plane.xAxis).applyMatrix4(m);
    const py = this.plane.origin.clone().add(this.plane.yAxis).applyMatrix4(m);
    const sx = px.distanceTo(origin);
    const sy = py.distanceTo(origin);
    if (sx === sy) {
      // U scale
      return new NArcCurve(plane, this.startAngle, this.endAngle, this.radius * sx);
    } else {
      // NU scale
      return new NEllipseArcCurve(plane, this.startAngle, this.endAngle, this.radius * sx, this.radius * sy);
    }
  }

  flip (): NArcCurve {
    return new NArcCurve(this.plane.flip(true, true), this.startAngle, this.endAngle, this.radius);
  }

  // https://github.com/mcneel/opennurbs/blob/7.x/opennurbs_arccurve.cpp#L756
  toNurbsCurve (): NNurbsCurve {
    const nurbs = new verb.geom.Arc(
      [this.plane.origin.x, this.plane.origin.y, this.plane.origin.z],
      [this.plane.xAxis.x, this.plane.xAxis.y, this.plane.xAxis.z],
      [this.plane.yAxis.x, this.plane.yAxis.y, this.plane.yAxis.z],
      this.radius,
      this.startAngle,
      this.endAngle
    );
    return new NNurbsCurve(nurbs);
  }

  toString (): string {
    return 'NArcCurve';
  }

  clone () {
    return new NArcCurve(this.plane, this.startAngle, this.endAngle, this.radius);
  }
}
