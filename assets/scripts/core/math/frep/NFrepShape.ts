import { NBoundingBox } from '../geometry';
import NFrep from './NFrep';

export default class NFrepShape extends NFrep {
  protected code: (p: string) => string;

  constructor (code: (p: string) => string, boundingBox: NBoundingBox) {
    super();
    this.code = code;
    this.boundingBox = boundingBox;
  }

  public compile (p: string = 'p'): string {
    return this.code(p);
  }
}
