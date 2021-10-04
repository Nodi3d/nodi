
import { Matrix4, Vector2, Vector3, Vector4 } from 'three';
import verb from '../../../lib/verb/verb';
import NDomain from '../../primitive/NDomain';
import { TransformerType } from '../ITransformable';
import NBoundingBox from '../NBoundingBox';
import NPlane from '../NPlane';
import NPoint from '../NPoint';
import NCurve from './NCurve';

export default class NNurbsCurve extends NCurve {
  public getCurvePlane (): NPlane {
    throw new Error('Method not implemented.');
  }

  verb: any;

  constructor (verb: any) {
    super();
    this.verb = verb;
  }

  public getPointAt (u: number): NPoint {
    const d = this.domain();
    u = Math.min(u, d.end - 1e-10);
    const arr = this.verb.point(u);
    return new NPoint(arr[0], arr[1], arr[2]);
  }

  public getTangentAt (u: number): Vector3 {
    const ret = this.verb.tangent(u);
    return (new Vector3(ret[0], ret[1], ret[2])).normalize();
  }

  public closestParam (p: Vector3): number | undefined {
    const t = this.verb.closestParam([p.x, p.y, p.z]);
    if (isNaN(t)) { return undefined; }
    return t as number;
  }

  public tessellate (): NPoint[] {
    return this.verb.tessellate().map((p: number[]) => new NPoint(p[0], p[1], p[2]));
  }

  public controlPoints (): Vector4[] {
    // return this.verb.controlPoints().map((p: number[]) => new Vector4(p[0], p[1], p[2], p[3]));
    return this.verb._data.controlPoints.map((p: number[]) => new Vector4(p[0], p[1], p[2], p[3]));
  }

  public weights (): number[] {
    return this.verb.weights() as number[];
  }

  public knots (): number[] {
    return this.verb.knots() as number[];
  }

  public length (): number {
    return this.verb.length();
  }

  public domain (): NDomain {
    const domain: { min: number; max: number } = this.verb.domain();
    return new NDomain(domain.min, domain.max);
  }

  public static byPoints (points: Vector3[], degree: number): NNurbsCurve {
    const curve = verb.geom.NurbsCurve.byPoints(points.map(p => p.toArray()), degree);
    return new NNurbsCurve(curve);
  }

  public static byKnotsControlPointsWeights (points: Vector3[], degree: number, knotVectors: number[]): NNurbsCurve {
    const curve = verb.geom.NurbsCurve.byKnotsControlPointsWeights(degree, knotVectors, points.map(p => p.toArray()));
    return new NNurbsCurve(curve);
  }

  public clone (): NNurbsCurve {
    const data = this.verb.asNurbs();
    const curve = new verb.geom.NurbsCurve(data);
    return new NNurbsCurve(curve);
  }

  private updateControlPoints (data: any, controlPoints: (Vector3 | Vector4)[]): void {
    data.controlPoints = data.controlPoints.map((arr: number[], i: number) => {
      const p = controlPoints[i];
      const w = arr[3];
      return [p.x, p.y, p.z, w];
    });
  }

  public replaceControlPoints (controlPoints: Vector3[]): void {
    const data = this.verb._data as any;
    if (data.controlPoints.length !== controlPoints.length) {
      throw new Error('# of input control points is not equal to target control points');
    }
    this.updateControlPoints(data, controlPoints);
  }

  public applyMatrix (m: Matrix4): NNurbsCurve {
    const controlPoints = this.controlPoints();
    const newControlPoints = controlPoints.map((p) => {
      return new Vector3(p.x, p.y, p.z).applyMatrix4(m);
    });
    const curve = this.clone();
    curve.replaceControlPoints(newControlPoints);
    return curve;
  }

  public transform (f: TransformerType): NNurbsCurve {
    const controlPoints = this.controlPoints().map((p) => {
      return f(new NPoint(p.x, p.y, p.z));
    });

    const data = this.verb.asNurbs();
    this.updateControlPoints(data, controlPoints);
    const curve = new verb.geom.NurbsCurve(data);
    return new NNurbsCurve(curve);
  }

  public flip (): NNurbsCurve {
    const controlPoints = this.controlPoints().reverse();
    const data = this.verb.asNurbs();
    this.updateControlPoints(data, controlPoints);
    const curve = new verb.geom.NurbsCurve(data);
    return new NNurbsCurve(curve);
  }

  public trim (min: number, max: number): NNurbsCurve {
    const source = this.verb.clone();
    const splitted0 = source.split(max);
    // const u = min / max;
    // const splitted1 = splitted0[0].split(u);
    const splitted1 = splitted0[0].split(min);
    const entity = splitted1[1];
    // const unified = verb.eval.Modify.unifyCurveKnotVectors([entity.asNurbs()])[0];
    // const uEntity = new verb.geom.NurbsCurve(unified);
    // return new NNurbsCurve(uEntity);
    return new NNurbsCurve(entity);
  }

  private remap (offset: number, parameters: number[]): number[] {
    const l = 1 - offset;
    return parameters.map((u) => {
      const t = (u - offset);
      if (t <= 0) {
        return t;
      } else {
        return (t / l);
      }
    });
  }

  public area (): number {
    throw new Error('Since the Nurbs Curve is not closed, it is not possible to calculate the area');
  }

  public center (): NPoint {
    throw new Error('Not implemented');
  }

  public bounds (plane: NPlane): NBoundingBox {
    const resolution = 16;
    const inv = 1 / (resolution - 1);
    const points = [];
    for (let i = 0; i < resolution; i++) {
      const u = i * inv;
      points.push(this.getPointAt(u));
    }
    return NBoundingBox.fromPoints(plane, points);
  }

  public divideByArcLength (unit: number): number[] {
    return this.verb.divideByArcLength(unit).map((u: any) => u.u as number);
  }

  public toNurbsCurve () {
    return this.clone();
  }

  public toString (): string {
    return 'NNurbsCurve';
  }
}
