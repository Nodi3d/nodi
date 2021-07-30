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
    this._closed = true;
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
    const xmin = f(this.plane.origin.clone().add(this.plane.xAxis.clone().multiplyScalar(this.x.min)));
    const xmax = f(this.plane.origin.clone().add(this.plane.xAxis.clone().multiplyScalar(this.x.max)));
    const ymin = f(this.plane.origin.clone().add(this.plane.yAxis.clone().multiplyScalar(this.y.min)));
    const ymax = f(this.plane.origin.clone().add(this.plane.yAxis.clone().multiplyScalar(this.y.max)));
    return this.transformed(plane, xmin, xmax, ymin, ymax);
  }

  public applyMatrix (m: Matrix4): NRectangleCurve {
    const plane = this.plane.applyMatrix(m);
    const xmin = this.plane.origin.clone().add(this.plane.xAxis.clone().multiplyScalar(this.x.min)).applyMatrix4(m);
    const xmax = this.plane.origin.clone().add(this.plane.xAxis.clone().multiplyScalar(this.x.max)).applyMatrix4(m);
    const ymin = this.plane.origin.clone().add(this.plane.yAxis.clone().multiplyScalar(this.y.min)).applyMatrix4(m);
    const ymax = this.plane.origin.clone().add(this.plane.yAxis.clone().multiplyScalar(this.y.max)).applyMatrix4(m);
    return this.transformed(plane, xmin, xmax, ymin, ymax);
  }

  private transformed (plane: NPlane, xmin: NPoint, xmax: NPoint, ymin: NPoint, ymax: NPoint): NRectangleCurve {
    xmin = xmin.sub(plane.origin);
    xmax = xmax.sub(plane.origin);
    ymin = ymin.sub(plane.origin);
    ymax = ymax.sub(plane.origin);
    const dx0 = plane.xAxis.dot(xmin);
    const dx1 = plane.xAxis.dot(xmax);
    const dy0 = plane.yAxis.dot(ymin);
    const dy1 = plane.yAxis.dot(ymax);
    return new NRectangleCurve(
      plane,
      new NDomain(dx0, dx1),
      new NDomain(dy0, dy1)
    );
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
