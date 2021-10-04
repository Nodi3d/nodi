import { NBoundingBox } from '../../geometry/NBoundingBox';
import { NPlane } from '../../geometry/NPlane';
import { NDomain } from '../../primitive/NDomain';
import { NFrep } from '../NFrep';
import { NFrepBase } from '../NFrepBase';

export class NFrepBlend extends NFrep {
  protected op: string;
  protected left: NFrepBase;
  protected right: NFrepBase;
  protected arg: string | undefined;

  constructor (op: string, left: NFrepBase, right: NFrepBase, arg: string | undefined = undefined) {
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
