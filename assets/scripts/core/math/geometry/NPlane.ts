import { Euler, Matrix4, Plane, Quaternion, Vector2, Vector3 } from 'three';
import ICopyable from '../../misc/ICopyable';
import NPoint from './NPoint';
import ITransformable, { TransformerType } from './ITransformable';

export default class NPlane implements ITransformable, ICopyable {
  origin: NPoint;
  normal: Vector3;
  xAxis: Vector3;
  yAxis: Vector3;

  public get constant (): number {
    const proj = this.origin.clone().projectOnVector(this.normal);
    return this.normal.dot(proj);
  }

  constructor (origin: NPoint = new NPoint(), xAxis: Vector3 = new Vector3(1, 0, 0), yAxis: Vector3 = new Vector3(0, 1, 0), normal: Vector3 | undefined = undefined) {
    xAxis = xAxis.clone().normalize();
    yAxis = yAxis.clone().normalize();

    if (normal === undefined) {
      normal = new Vector3();
      normal = normal.crossVectors(xAxis, yAxis);
    }
    this.origin = origin.clone();
    this.normal = normal;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public distanceToPoint (point: Vector3): number {
    const projected = point.clone().projectOnPlane(this.normal);
    const d = projected.distanceTo(point);
    const sign = Math.sign(this.normal.dot(point));
    return (sign * d) - this.constant;
  }

  public findLineIntersection (start: NPoint, end: NPoint): NPoint | undefined {
    const dir = (new Vector3()).subVectors(end, start);

    // if line & plane are parallel
    const denominator = this.normal.dot(dir);
    const epsilon = Number.EPSILON;
    if (Math.abs(denominator) <= epsilon) {
      const dist = this.distanceToPoint(start);
      if (Math.abs(dist) <= epsilon) {
        return start.clone();
      }
      return undefined;
    }

    const t = (this.normal.dot(this.origin) - this.normal.dot(start)) / denominator;
    if (t < 0 || t > 1) { return undefined; }

    return start.clone().add(dir.multiplyScalar(t));
  }

  public project (point: Vector3): Vector2 {
    const projected = point.clone().projectOnPlane(this.normal);
    // const o = this.origin.clone().projectOnPlane(this.normal);
    return new Vector2(
      this.xAxis.dot(projected) - this.xAxis.dot(this.origin),
      this.yAxis.dot(projected) - this.yAxis.dot(this.origin)
    );
  }

  public unproject (point: Vector2): NPoint {
    const dx = this.xAxis.clone().multiplyScalar(point.x);
    const dy = this.yAxis.clone().multiplyScalar(point.y);
    return this.origin.clone().add(dx).add(dy);
  }

  public projectPoint (point: Vector3): Vector3 {
    return this.normal.clone().multiplyScalar(-this.distanceToPoint(point)).add(point);
  }

  public map (point: Vector3): Vector3 {
    return this.xAxis.clone().multiplyScalar(point.x).add(this.yAxis.clone().multiplyScalar(point.z)).add(this.normal.clone().multiplyScalar(point.y)).add(this.origin);
  }

  public flip (rx = true, ry = true, swap = false): NPlane {
    const flipped = this.clone();

    if (rx) {
      flipped.xAxis.multiplyScalar(-1);
    }
    if (ry) {
      flipped.yAxis.multiplyScalar(-1);
    }

    if (swap) {
      const dx = flipped.xAxis.clone();
      flipped.xAxis.copy(flipped.yAxis);
      flipped.yAxis.copy(dx);
    }

    flipped.normal.copy((new Vector3()).crossVectors(flipped.xAxis, flipped.yAxis));

    return flipped;
  }

  public mirror (point: Vector3): Vector3 {
    const projected = point.clone().projectOnPlane(this.normal);
    const offset = (new Vector3().subVectors(point, this.origin)).projectOnVector(this.normal);
    const origin = this.origin.clone().projectOnVector(this.normal);
    return projected.add(offset.multiplyScalar(-1)).add(origin);
  }

  public rotation (): Euler {
    const m = new Matrix4();
    m.lookAt(this.origin, this.origin.clone().add(this.normal), this.yAxis);
    const e = new Euler();
    e.setFromRotationMatrix(m);
    return e;
  }

  public toString (): string {
    return `(origin:${this.origin}, x:(${this.xAxis.x},${this.xAxis.y}, ${this.xAxis.z}), y:(${this.yAxis.x},${this.yAxis.y},${this.yAxis.z}), normal:(${this.normal.x},${this.normal.y},${this.normal.z}))`;
  }

  public clone () {
    return new NPlane(this.origin.clone(), this.xAxis.clone(), this.yAxis.clone(), this.normal.clone());
  }

  public applyMatrix (m: Matrix4): NPlane {
    const T = new Vector3();
    const R = new Quaternion();
    const S = new Vector3();
    m.decompose(T, R, S);
    const dx = this.xAxis.clone().applyQuaternion(R);
    const dy = this.yAxis.clone().applyQuaternion(R);
    const normal = this.normal.clone().applyQuaternion(R);
    return new NPlane(this.origin.clone().applyMatrix(m), dx, dy, normal);
  }

  public transform (f: TransformerType): NPlane {
    const plane = this.clone();

    const origin = plane.origin.clone();

    const transformedOrigin = plane.origin = f(plane.origin);

    plane.origin.copy(transformedOrigin);
    plane.normal = f(origin.clone().add(plane.normal)).sub(transformedOrigin).normalize();
    plane.xAxis = f(origin.clone().add(plane.xAxis)).sub(transformedOrigin).normalize();
    plane.yAxis = f(origin.clone().add(plane.yAxis)).sub(transformedOrigin).normalize();

    return plane;
  }

  public static fromOriginNormal (origin: NPoint, normal: Vector3): NPlane {
    let dx = new Vector3(1, 0, 0);
    const nn = normal.clone().normalize();

    const dot = Math.abs(nn.dot(dx));
    if (dot >= 1.0) {
      dx = new Vector3(0, 1, 0);
    }

    const dy = (new Vector3()).crossVectors(dx, nn);
    dx = (new Vector3()).crossVectors(dy, nn);

    return new NPlane(origin, dx, dy, normal);
  }

  copy (source: NPlane): this {
    this.origin.copy(source.origin);
    this.normal.copy(source.normal);
    this.xAxis.copy(source.xAxis);
    this.yAxis.copy(source.yAxis);

    return this;
  }
}
