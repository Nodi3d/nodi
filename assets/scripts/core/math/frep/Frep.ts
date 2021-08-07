import { Matrix4 } from 'three';
import ITransformable, { TransformerType } from '../geometry/ITransformable';
import FrepBase from './FrepBase';
import FrepMatrix from './FrepMatrix';

export default abstract class Frep extends FrepBase {
  public applyMatrix (matrix: Matrix4): ITransformable {
    return new FrepMatrix(this, matrix);
  }

  public transform (f: TransformerType): ITransformable {
    throw new Error('Method not implemented.');
  }
}
