import { Matrix4, Vector3 } from 'three';
import { TransformerType } from '../ITransformable';
import NBoundingBox from '../NBoundingBox';
import NPlane from '../NPlane';
import NPoint from '../NPoint';
import NCurve from './NCurve';
import NNurbsCurve from './NNurbsCurve';

export default class NLineCurve extends NCurve {
  public getCurvePlane (): NPlane {
    throw new Error('Method not implemented.');
  }

  private _a: NPoint;
  private _b: NPoint;

  constructor (a: NPoint, b: NPoint) {
    super();
    this._a = a;
    this._b = b;
  }

  public get a (): NPoint {
    return this._a;
  }

  public get b (): NPoint {
    return this._b;
  }

  public get points (): NPoint[] {
    return [this.a, this.b];
  }

  public area (): number {
    return 0;
  }

  public center (): NPoint {
    return this.getPointAt(0.5);
  }

  public getParameter (point: Vector3): number {
    const sub0 = (new Vector3()).subVectors(this.b, this.a);
    const sub1 = (new Vector3()).subVectors(point, this.a);
    return sub1.length() / sub0.length();
  }

  public getPointAt (t01: number): NPoint {
    const dir = (new Vector3()).subVectors(this.b, this.a);
    const len = dir.length();
    const v = dir.normalize().multiplyScalar(len * t01).add(this.a);
    const p = new NPoint().copy(v);
    return p;
  }

  public getTangent (): Vector3 {
    return (new Vector3()).subVectors(this.b, this.a).normalize();
  }

  public length (): number {
    return this.a.distanceTo(this.b);
  }

  public applyMatrix (m: Matrix4): NLineCurve {
    const a = this.a.clone().applyMatrix4(m);
    const b = this.b.clone().applyMatrix4(m);
    return new NLineCurve(a, b);
  }

  public clone (): NLineCurve {
    return new NLineCurve(this.a.clone(), this.b.clone());
  }

  public transform (f: TransformerType): NLineCurve {
    const a = f(this.a.clone());
    const b = f(this.b.clone());
    return new NLineCurve(a, b);
  }

  public flip (): NLineCurve {
    return new NLineCurve(this.b.clone(), this.a.clone());
  }

  public trim (min: number, max: number) {
    const dir = (new Vector3()).subVectors(this.b.clone(), this.a.clone());
    const a = this.a.clone().add(dir.clone().multiplyScalar(min));
    const b = this.a.clone().add(dir.clone().multiplyScalar(max));
    return new NLineCurve(a, b);
  }

  public bounds (plane: NPlane): NBoundingBox {
    return NBoundingBox.fromPoints(plane, [this.a, this.b]);
  }

  public toNurbsCurve (): NNurbsCurve {
    return NNurbsCurve.byPoints([this.a, this.b], 1);
  }

  public toString (): string {
    return 'NLineCurve';
  }
}
