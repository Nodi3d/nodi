import { NBoundingBox } from '../geometry/NBoundingBox';
import { NFrepShape } from './NFrepShape';
import { IFrepCustomFunction } from './misc/IFrepCustomFunction';

export class NFrepFunctionShape extends NFrepShape implements IFrepCustomFunction {
  public fn(): string {
    return this._fn;
  }

  protected _fn: string;

  constructor (
    code: (p: string) => string, boundingBox: NBoundingBox,
    fun: string,
  ) {
    super(code, boundingBox);
    this._fn = fun;
  }
}
