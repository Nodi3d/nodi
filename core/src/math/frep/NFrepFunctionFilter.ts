import { NBoundingBox } from '../geometry/NBoundingBox';
import { NFrepBase } from './NFrepBase';
import { NFrepFilter } from './NFrepFilter';
import { IFrepCustomFunction } from './misc/IFrepCustomFunction';

export class NFrepFunctionFilter extends NFrepFilter implements IFrepCustomFunction {
  public fn(): string {
    return this._fn;
  }

  protected _fn: string;

  constructor (
    code: (p: string) => string, frep: NFrepBase, boundingBox: NBoundingBox,
    fun: string,
  ) {
    super(code, frep, boundingBox);
    this._fn = fun;
  }
}
