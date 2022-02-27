import { Matrix4 } from 'three';
import { NBoundingBox } from '../geometry/NBoundingBox';
import { TransformerType, ITransformable } from '../geometry/ITransformable';

export abstract class NFrepBase implements ITransformable {
  public boundingBox!: NBoundingBox;

  public abstract compile(p: string): string;

  public serialize (): string {
    return this.compile('p');
  }

  public toString (): string {
    return 'FRep';
  }

  public abstract applyMatrix (matrix: Matrix4): ITransformable;
  public abstract transform (f: TransformerType): ITransformable;
}
