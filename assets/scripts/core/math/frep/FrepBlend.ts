import FrepBase from './FrepBase';

export default class FrepBlend extends FrepBase {
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
}
