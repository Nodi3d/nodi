import FrepBase from './FrepBase';
import FrepBlend from './FrepBlend';

export default class FrepDifferenceBlend extends FrepBlend {
  constructor (left: FrepBase, right: FrepBase) {
    super('opDifference', left, right);

    const bb0 = this.left.boundingBox;
    const bb1 = this.right.boundingBox;
    this.boundingBox = bb0;
  }
}
