import FrepBase from './FrepBase';
import FrepBlend from './FrepBlend';

export default class FrepDifferenceBlend extends FrepBlend {
  constructor (left: FrepBase, right: FrepBase) {
    super('opDifference', left, right);
    this.boundingBox = this.left.boundingBox;
  }
}
