import { NFrepBase } from '../NFrepBase';
import { NFrepBlend } from './NFrepBlend';

export class NFrepSmoothDifferenceBlend extends NFrepBlend {
  constructor (left: NFrepBase, right: NFrepBase, arg: string | undefined) {
    super('opSmoothDifference', left, right, arg);
    this.boundingBox = this.left.boundingBox;
  }
}
