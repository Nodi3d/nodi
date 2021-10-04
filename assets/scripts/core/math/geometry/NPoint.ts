import { Matrix4, Vector3 } from 'three';
import ICopyable from '../../misc/ICopyable';
import ITransformable, { TransformerType } from './ITransformable';

export default class NPoint extends Vector3 implements ITransformable, ICopyable {
  public static fromVector (v: Vector3): NPoint {
    return new NPoint(v.x, v.y, v.z);
  }

  public toVector (): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public toString (): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }

  applyMatrix (matrix: Matrix4): NPoint {
    return this.clone().applyMatrix4(matrix);
  }

  transform (f: TransformerType): NPoint {
    const v = f(this.clone());
    return v;
  }

  copy (source: NPoint | Vector3): this {
    this.set(source.x, source.y, source.z);
    return this;
  }
}
