import { Matrix4, Vector3 } from 'three';
import verb from '../../../lib/verb/verb';
import { TWO_PI } from '../../Constant';
import { TransformerType } from '../ITransformable';
import NPlane from '../NPlane';
import NPoint from '../NPoint';
import NNurbsCurve from './NNurbsCurve';
import NPlaneCurve from './NPlaneCurve';

export default class NEllipseArcCurve extends NPlaneCurve {
  protected startAngle: number;
  protected endAngle: number;
  protected angle: number;
  protected xRadius: number;
  protected yRadius: number;

  constructor (plane = new NPlane(), start = 0, end = Math.PI * 2, xRadius = 1, yRadius = 1) {
    const len = end - start;

    super(plane);
    this.startAngle = start;
    this.endAngle = end;
    this.angle = len;
    this.xRadius = xRadius;
    this.yRadius = yRadius;
  }

  getXRadius (): number {
    return this.xRadius;
  }

  getYRadius (): number {
    return this.yRadius;
  }

  getPointAt (t: number): NPoint {
    const r = this.startAngle + t * this.angle;

    const x = Math.cos(r) * this.xRadius;
    const y = Math.sin(r) * this.yRadius;
    const p = this.plane.origin.clone();
    p.add(this.plane.xAxis.clone().multiplyScalar(x));
    p.add(this.plane.yAxis.clone().multiplyScalar(y));
    return p;
  }

  length (): number {
    // https://math.stackexchange.com/questions/433094/how-to-determine-the-arc-length-of-ellipse
    const resolution = 32;
    const dx = this.xRadius * this.xRadius;
    const dy = this.yRadius * this.yRadius;
    const dt = (1 / (resolution - 1)) * this.angle;
    let l = 0;
    for (let i = 0; i < resolution; i++) {
      const t = i * dt + this.startAngle;
      const s = Math.sin(t);
      const c = Math.cos(t);
      const delta = Math.sqrt(dx * s * s + dy * c * c) * dt;
      l += delta;
    }
    return l;
  }

  public area (): number {
    const r = Math.abs(this.endAngle - this.startAngle) / TWO_PI;
    return this.xRadius * this.yRadius * Math.PI * r;
  }

  public center (): NPoint {
    throw new Error('Not implemented');
  }

  trim (min: number, max: number): NEllipseArcCurve {
    const interval = this.endAngle - this.startAngle;
    const start = interval * min + this.startAngle;
    const end = interval * max + this.startAngle;
    return new NEllipseArcCurve(this.plane, start, end, this.xRadius, this.yRadius);
  }

  transform (f: TransformerType): NEllipseArcCurve {
    const plane = this.plane.transform(f);

    const origin = f(this.plane.origin.clone());
    const px = f(this.plane.origin.clone().add(this.plane.xAxis));
    const py = f(this.plane.origin.clone().add(this.plane.yAxis));
    const sx = px.distanceTo(origin);
    const sy = py.distanceTo(origin);
    return new NEllipseArcCurve(plane, this.startAngle, this.endAngle, this.xRadius * sx, this.yRadius * sy);
  }

  applyMatrix (m: Matrix4): NEllipseArcCurve {
    const plane = this.plane.applyMatrix(m);

    const origin = this.plane.origin.clone().applyMatrix4(m);
    const px = this.plane.origin.clone().add(this.plane.xAxis).applyMatrix4(m);
    const py = this.plane.origin.clone().add(this.plane.yAxis).applyMatrix4(m);
    const sx = px.distanceTo(origin);
    const sy = py.distanceTo(origin);

    return new NEllipseArcCurve(plane, this.startAngle, this.endAngle, this.xRadius * sx, this.yRadius * sy);
  }

  flip (): NEllipseArcCurve {
    return new NEllipseArcCurve(this.plane.flip(true, true), this.startAngle, this.endAngle, this.xRadius, this.yRadius);
  }

  // https://github.com/mcneel/opennurbs/blob/7.x/opennurbs_arccurve.cpp#L756
  toNurbsCurve (): NNurbsCurve {
    const nurbs = new verb.geom.EllipseArc(
      [this.plane.origin.x, this.plane.origin.y, this.plane.origin.z], // center
      [this.plane.xAxis.x * this.xRadius, this.plane.xAxis.y * this.xRadius, this.plane.xAxis.z * this.xRadius], // x axis
      [this.plane.yAxis.x * this.yRadius, this.plane.yAxis.y * this.yRadius, this.plane.yAxis.z * this.yRadius], // y axis
      this.startAngle, // min angle
      this.endAngle // max angle
    );
    return new NNurbsCurve(nurbs);
  }

  toString (): string {
    return 'NEllipseArcCurve';
  }

  clone () {
    return new NEllipseArcCurve(this.plane, this.startAngle, this.endAngle, this.xRadius, this.yRadius);
  }
}
