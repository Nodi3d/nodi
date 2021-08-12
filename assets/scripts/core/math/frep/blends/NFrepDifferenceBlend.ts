import NFrepBase from '../NFrepBase';
import NFrepBlend from './NFrepBlend';

export default class NFrepDifferenceBlend extends NFrepBlend {
  constructor (left: NFrepBase, right: NFrepBase) {
    super('opDifference', left, right);
    this.boundingBox = this.left.boundingBox;
  }
}
