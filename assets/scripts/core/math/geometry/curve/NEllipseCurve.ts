import { Matrix4, Vector3 } from 'three';
import verb from '../../../lib/verb/verb';
import { TransformerType } from '../ITransformable';
import NPlane from '../NPlane';
import NPoint from '../NPoint';
import IClosedCurve from './IClosedCurve';
import NEllipseArcCurve from './NEllipseArcCurve';
import NNurbsCurve from './NNurbsCurve';

export default class NEllipseCurve extends NEllipseArcCurve implements IClosedCurve {
  constructor (plane = new NPlane(), xRadius = 1, yRadius = 1) {
    super(plane, 0, Math.PI * 2, xRadius, yRadius);
    this.closed = true;
  }

  public area (): number {
    return this.xRadius * this.yRadius * Math.PI;
  }

  public center (): NPoint {
    return this.plane.origin;
  }

  contains (point: Vector3): boolean {
    const projected = this.project(point);
    const sqd = (projected.x * projected.x) / (this.xRadius * this.xRadius) + (projected.y * projected.y) / (this.yRadius * this.yRadius);
    return sqd <= 1;
  }

  transform (f: TransformerType): NEllipseCurve {
    const transformed = super.transform(f) as NEllipseArcCurve;
    return new NEllipseCurve(transformed.getPlane(), transformed.getXRadius(), transformed.getYRadius());
  }

  applyMatrix (m: Matrix4): NEllipseCurve {
    const arc = super.applyMatrix(m);
    return new NEllipseCurve(arc.getPlane(), arc.getXRadius(), arc.getYRadius());
  }

  flip (): NEllipseCurve {
    return new NEllipseCurve(this.plane.flip(true, true), this.xRadius, this.yRadius);
  }

  length (): number {
    const resolution = 32;

    // https://sites.google.com/site/jwbibleprophesy/sugaku-2
    const dt = 1 / resolution;
    const sqDt = dt * dt;
    const ratio = this.xRadius / this.yRadius;
    const sqRatio = ratio * ratio;
    let l = 0;

    for (let i = 1; i <= resolution; i++) {
      const d0 = dt * (i - 1);
      const d1 = dt * i;
      const d2 = Math.sqrt(1 - d0 * d0) - Math.sqrt(1 - d1 * d1);
      const d3 = (sqDt + (sqRatio * d2 * d2));
      if (d3 > 0) {
        l += Math.sqrt(d3);
      }
    }
    return l * this.yRadius * 4;
  }

  // https://github.com/mcneel/opennurbs/blob/7.x/opennurbs_arccurve.cpp#L756
  toNurbsCurve () {
    const nurbs = new verb.geom.Ellipse(
      [this.plane.origin.x, this.plane.origin.y, this.plane.origin.z],
      [this.plane.xAxis.x * this.xRadius, this.plane.xAxis.y * this.xRadius, this.plane.xAxis.z * this.xRadius],
      [this.plane.yAxis.x * this.yRadius, this.plane.yAxis.y * this.yRadius, this.plane.yAxis.z * this.yRadius]
    );
    return new NNurbsCurve(nurbs);
  }

  toString (): string {
    return 'NEllipseCurve';
  }

  clone () {
    return new NEllipseCurve(this.plane, this.xRadius, this.yRadius);
  }
}
