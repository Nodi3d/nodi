import { Matrix4 } from 'three';
import { TransformerType, ITransformable } from '../geometry/ITransformable';
import { NFrepBase } from './NFrepBase';
import { NFrepMatrix } from './NFrepMatrix';

export abstract class NFrep extends NFrepBase {
  public applyMatrix (matrix: Matrix4): ITransformable {
    return new NFrepMatrix(this, matrix);
  }

  public transform (f: TransformerType): ITransformable {
    throw new Error('Method not implemented.');
  }
}
