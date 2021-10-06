
import { Matrix4, Vector3 } from 'three';
import verb from '../../../lib/verb/verb';
import { TWO_PI } from '../../Constant';
import { NMathHelper } from '../../NMathHelper';
import { TransformerType } from '../ITransformable';
import { NPlane } from '../NPlane';
import { NPoint } from '../NPoint';
import { IClosedCurve } from './IClosedCurve';
import { NArcCurve } from './NArcCurve';
import { NCurve } from './NCurve';
import { NEllipseArcCurve } from './NEllipseArcCurve';
import { NEllipseCurve } from './NEllipseCurve';
import { NNurbsCurve } from './NNurbsCurve';

export class NCircleCurve extends NArcCurve implements IClosedCurve {
  sqRadius: number;

  constructor (plane = new NPlane(), radius = 1) {
    super(plane, 0, Math.PI * 2, radius);
    this.sqRadius = this.radius * this.radius;
    this.closed = true;
  }

  static from3Points (a: Vector3, b: Vector3, c: Vector3): NCircleCurve {
    const normal = NMathHelper.normalFrom3Points(a, b, c);
    const plane = NPlane.fromOriginNormal(new NPoint(), normal);

    const p0 = plane.project(a);
    const p1 = plane.project(b);
    const p2 = plane.project(c);

    // http://paulbourke.net/geometry/circlesphere/
    const offset = Math.pow(p1.x, 2) + Math.pow(p1.y, 2);
    const bc = (Math.pow(p0.x, 2) + Math.pow(p0.y, 2) - offset) / 2.0;
    const cd = (offset - Math.pow(p2.x, 2) - Math.pow(p2.y, 2)) / 2.0;
    const det = (p0.x - p1.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p0.y - p1.y);

    if (Math.abs(det) < 1e-10) {
      throw new Error(`Cannot create Circle from 3 points (${a.x}, ${a.y}, ${a.z}), (${b.x}, ${b.y}, ${b.z}), (${c.x}, ${c.y}, ${c.z})`);
    }

    const idet = 1 / det;

    const cx = (bc * (p1.y - p2.y) - cd * (p0.y - p1.y)) * idet;
    const cy = (cd * (p0.x - p1.x) - bc * (p1.x - p2.x)) * idet;
    const radius = Math.sqrt(Math.pow(p1.x - cx, 2) + Math.pow(p1.y - cy, 2));

    const orig = plane.xAxis.clone().multiplyScalar(cx).add(plane.yAxis.clone().multiplyScalar(cy));
    return new NCircleCurve(new NPlane(NPoint.fromVector(orig), plane.xAxis, plane.yAxis, normal), radius);
  }

  public area (): number {
    return this.radius * this.radius * Math.PI;
  }

  public center (): NPoint {
    return this.plane.origin;
  }

  public contains (point: Vector3): boolean {
    const projected = this.project(point);
    const sqd = projected.x * projected.x + projected.y * projected.y;
    return sqd <= this.sqRadius;
  }

  public length (): number {
    // 2πr
    return TWO_PI * this.radius;
  }

  public transform (f: TransformerType): NCurve {
    const transformed = super.transform(f);

    if (transformed instanceof NArcCurve) {
      return new NCircleCurve(transformed.getPlane(), transformed.getRadius());
    } else if (transformed instanceof NEllipseCurve) {
      // EllipseCurve
      return new NEllipseCurve(transformed.getPlane(), transformed.getXRadius(), transformed.getYRadius());
    }

    throw new Error('Failed to transform');
  }

  public applyMatrix (m: Matrix4): NCurve {
    const curve = super.applyMatrix(m) as (NArcCurve | NEllipseArcCurve);
    if (curve instanceof NArcCurve) {
      return new NCircleCurve(curve.getPlane(), curve.getRadius());
    } else {
      return new NEllipseCurve(curve.getPlane(), curve.getXRadius(), curve.getYRadius());
    }
  }

  public flip () {
    return new NCircleCurve(this.plane.flip(true, true), this.radius);
  }

  // https://github.com/mcneel/opennurbs/blob/7.x/opennurbs_arccurve.cpp#L756
  toNurbsCurve () {
    const nurbs = new verb.geom.Circle(
      [this.plane.origin.x, this.plane.origin.y, this.plane.origin.z],
      [this.plane.xAxis.x, this.plane.xAxis.y, this.plane.xAxis.z],
      [this.plane.yAxis.x, this.plane.yAxis.y, this.plane.yAxis.z],
      this.radius
    );
    return new NNurbsCurve(nurbs);
  }

  public toString (): string {
    return 'NCircleCurve';
  }

  public clone () {
    return new NCircleCurve(this.plane, this.radius);
  }
}
