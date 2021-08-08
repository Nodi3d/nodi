import FrepBase from './FrepBase';
import FrepBlend from './FrepBlend';

export default class FrepSmoothDifferenceBlend extends FrepBlend {
  constructor (left: FrepBase, right: FrepBase, arg: string | undefined) {
    super('opSmoothDifference', left, right, arg);
    this.boundingBox = this.left.boundingBox;
  }
}
