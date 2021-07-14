import { Matrix4, Vector3 } from 'three';
import Helper from '../../Helper';
import NDomain from '../../primitive/NDomain';
import { TransformerType } from '../ITransformable';
import NPlane from '../NPlane';
import NPoint from '../NPoint';
import IClosedCurve from './IClosedCurve';
import NCurve from './NCurve';
import NNurbsCurve from './NNurbsCurve';
import NPlaneCurve from './NPlaneCurve';

export default class NRectangleCurve extends NPlaneCurve implements IClosedCurve {
  private x: NDomain;
  private y: NDomain;

  constructor (plane = new NPlane(), x: NDomain = new NDomain(0, 1), y: NDomain = new NDomain(0, 1)) {
    super(plane);
    this.x = x;
    this.y = y;
  }

  public get points (): NPoint[] {
    return this.getCornerPoints();
  }

  public area (): number {
    return this.x.size * this.y.size;
  }

  public length (): number {
    return this.x.size * 2 + this.y.size * 2;
  }

  public center (): NPoint {
    const dx = this.plane.xAxis.clone().multiplyScalar(this.x.start + this.x.size * 0.5);
    const dy = this.plane.yAxis.clone().multiplyScalar(this.y.start + this.y.size * 0.5);
    return this.plane.origin.clone().add(dx).add(dy);
  }

  public transform (f: TransformerType): NRectangleCurve {
    const plane = this.plane.transform(f);

    const origin = f(this.plane.origin.clone());
    const px = f(this.plane.origin.clone().add(this.plane.xAxis));
    const py = f(this.plane.origin.clone().add(this.plane.yAxis));
    const sx = px.distanceTo(origin);
    const sy = py.distanceTo(origin);
    return new NRectangleCurve(plane, this.x.multiply(sx), this.y.multiply(sy));
  }

  public applyMatrix (m: Matrix4): NRectangleCurve {
    const plane = this.plane.applyMatrix(m);

    const origin = this.plane.origin.clone().applyMatrix4(m);
    const px = this.plane.origin.clone().add(this.plane.xAxis).applyMatrix4(m);
    const py = this.plane.origin.clone().add(this.plane.yAxis).applyMatrix4(m);
    const sx = px.distanceTo(origin);
    const sy = py.distanceTo(origin);
    return new NRectangleCurve(plane, this.x.multiply(sx), this.y.multiply(sy));
  }

  public getPointAt (t: number): NPoint {
    const points = this.getCornerPoints();
    const n = points.length;
    const p = n * t;
    const intPoint = Math.floor(p);
    const weight = p - intPoint;
    const p0 = points[intPoint % n];
    const p1 = points[(intPoint + 1) % n];
    return new NPoint(
      Helper.lerp(p0.x, p1.x, weight),
      Helper.lerp(p0.y, p1.y, weight),
      Helper.lerp(p0.z, p1.z, weight)
    );
  }

  public flip (): NCurve {
    return new NRectangleCurve(this.plane.flip(true, true), this.x.clone(), this.y.clone());
  }

  public trim (min: number, max: number): NCurve {
    const nurbs = this.toNurbsCurve();
    return nurbs.trim(min, max);
  }

  public getCornerPoints (): NPoint[] {
    const o = this.plane.origin;
    const dx = this.plane.xAxis;
    const dy = this.plane.yAxis;
    return [
      o.clone().add(dx.clone().multiplyScalar(this.x.start)).add(dy.clone().multiplyScalar(this.y.start)),
      o.clone().add(dx.clone().multiplyScalar(this.x.end)).add(dy.clone().multiplyScalar(this.y.start)),
      o.clone().add(dx.clone().multiplyScalar(this.x.end)).add(dy.clone().multiplyScalar(this.y.end)),
      o.clone().add(dx.clone().multiplyScalar(this.x.start)).add(dy.clone().multiplyScalar(this.y.end))
    ];
  }

  public contains (point: Vector3): boolean {
    const p = this.project(point);
    return this.x.includes(p.x) && this.y.includes(p.y);
  }

  public toNurbsCurve (): NNurbsCurve {
    const points = this.getCornerPoints();
    points.push(points[0]); // close
    return NNurbsCurve.byPoints(points, 1);
  }

  public toString (): string {
    return 'NRectangleCurve';
  }

  clone () {
    return new NRectangleCurve(this.plane.clone(), this.x.clone(), this.y.clone());
  }
}
