import { NFrepBase } from '../NFrepBase';
import { NFrepBlend } from './NFrepBlend';

export class NFrepSmoothIntersectionBlend extends NFrepBlend {
  constructor (left: NFrepBase, right: NFrepBase, arg: string | undefined) {
    super('opSmoothIntersection', left, right, arg);

    const minmax0 = this.left.boundingBox.getMinMax();
    const minmax1 = this.right.boundingBox.getMinMax();
    const minX = Math.max(minmax0.min.x, minmax1.min.x);
    const minY = Math.max(minmax0.min.y, minmax1.min.y);
    const minZ = Math.max(minmax0.min.z, minmax1.min.z);
    const maxX = Math.min(minmax0.max.x, minmax1.max.x);
    const maxY = Math.min(minmax0.max.y, minmax1.max.y);
    const maxZ = Math.min(minmax0.max.z, minmax1.max.z);

    this.boundingBox = this.worldMinMaxToBoundingBox(minX, minY, minZ, maxX, maxY, maxZ);
  }
}
