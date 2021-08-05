import { NBoundingBox, NPlane } from '../geometry';
import { NDomain } from '../primitive';

export default abstract class FrepBase {
  public boundingBox!: NBoundingBox;

  public abstract compile(p: string): string;

  public serialize (): string {
    return this.compile('p');
  }

  public worldMinMaxToBoundingBox (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
    return new NBoundingBox(new NPlane(), new NDomain(minX, maxX), new NDomain(minY, maxY), new NDomain(minZ, maxZ));
  }
}
