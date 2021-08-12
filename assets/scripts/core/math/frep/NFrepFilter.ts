import { Matrix4 } from 'three';
import { NBoundingBox } from '../geometry';
import ITransformable, { TransformerType } from '../geometry/ITransformable';
import NFrepBase from './NFrepBase';
import NFrepMatrix from './NFrepMatrix';

export default class NFrepFilter extends NFrepBase {
  public applyMatrix (matrix: Matrix4): ITransformable {
    return new NFrepMatrix(this, matrix);
  }

  public transform (f: TransformerType): ITransformable {
    throw new Error('Method not implemented.');
  }

  protected code: (p: string) => string;
  public frep: NFrepBase;

  constructor (code: (p: string) => string, frep: NFrepBase, boundingBox: NBoundingBox) {
    super();
    this.code = code;
    this.frep = frep;
    this.boundingBox = boundingBox;
  }

  public compile (p: string = 'p'): string {
    return this.code(p);
  }
}
