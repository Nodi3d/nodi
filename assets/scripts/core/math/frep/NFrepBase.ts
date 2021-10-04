import { Matrix4 } from 'three';
import { NBoundingBox } from '../geometry';
import ITransformable, { TransformerType } from '../geometry/ITransformable';

export default abstract class NFrepBase implements ITransformable {
  public boundingBox!: NBoundingBox;

  public abstract compile(p: string): string;

  public serialize (): string {
    return this.compile('p');
  }

  public abstract applyMatrix (matrix: Matrix4): ITransformable;
  public abstract transform (f: TransformerType): ITransformable;
}
