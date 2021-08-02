import { NBoundingBox } from '../geometry';
import FrepBase from './FrepBase';

export default class FrepShape extends FrepBase {
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
