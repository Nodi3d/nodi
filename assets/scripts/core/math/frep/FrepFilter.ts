import { Matrix4 } from 'three';
import { NBoundingBox } from '../geometry';
import ITransformable, { TransformerType } from '../geometry/ITransformable';
import FrepBase from './FrepBase';
import FrepMatrix from './FrepMatrix';

export default class FrepFilter extends FrepBase {
  public applyMatrix (matrix: Matrix4): ITransformable {
    return new FrepMatrix(this, matrix);
  }

  public transform (f: TransformerType): ITransformable {
    throw new Error('Method not implemented.');
  }

  protected code: (p: string) => string;
  public frep: FrepBase;

  constructor (code: (p: string) => string, frep: FrepBase, boundingBox: NBoundingBox) {
    super();
    this.code = code;
    this.frep = frep;
    this.boundingBox = boundingBox;
  }

  public compile (p: string = 'p'): string {
    return this.code(p);
  }
}
