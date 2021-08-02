import { NBoundingBox } from '../geometry';
import FrepBase from './FrepBase';

export default class FrepFilter extends FrepBase {
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
