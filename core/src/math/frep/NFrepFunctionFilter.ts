import { Matrix4 } from 'three';
import { NBoundingBox } from '../geometry/NBoundingBox';
import { TransformerType, ITransformable } from '../geometry/ITransformable';
import { NFrepBase } from './NFrepBase';
import { NFrepMatrix } from './NFrepMatrix';
import { NFrepFilter } from './NFrepFilter';

export class NFrepFunctionFilter extends NFrepFilter {
  public get fn(): string {
    return this._fn;
  }

  protected _fn: string;

  public transform (f: TransformerType): ITransformable {
    throw new Error('Method not implemented.');
  }

  constructor (
    code: (p: string) => string, frep: NFrepBase, boundingBox: NBoundingBox,
    fun: string,
  ) {
    super(code, frep, boundingBox);
    this._fn = fun;
  }
}
