import { NBoundingBox, NPlane } from '../geometry';
import { NDomain } from '../primitive';
import Frep from './Frep';
import FrepBase from './FrepBase';

export default class FrepBlend extends Frep {
  protected op: string;
  protected left: FrepBase;
  protected right: FrepBase;
  protected arg: string | undefined;

  constructor (op: string, left: FrepBase, right: FrepBase, arg: string | undefined = undefined) {
    super();
    this.op = op;
    this.left = left;
    this.right = right;
    this.arg = arg;
  }

  public compile (p = 'p'): string {
    if (this.arg !== undefined) {
      return `${this.op}(${this.left.compile(p)}, ${this.right.compile(p)}, ${this.arg})`;
    } else {
      return `${this.op}(${this.left.compile(p)}, ${this.right.compile(p)})`;
    }
  }

  public worldMinMaxToBoundingBox (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
    return new NBoundingBox(new NPlane(), new NDomain(minX, maxX), new NDomain(minY, maxY), new NDomain(minZ, maxZ));
  }
}
