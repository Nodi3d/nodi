import { NBoundingBox, NPlane } from '../geometry';
import { NDomain } from '../primitive';

export default abstract class FrepBase {
  public boundingBox!: NBoundingBox;

  public abstract compile(p: string): string;

  public serialize (): string {
    const code = this.compile('p');
    return code;
  }

  // plane domain conversion
  public worldMinMaxToBoundingBox (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
    return new NBoundingBox(new NPlane(), new NDomain(minX, maxX), new NDomain(minZ, maxZ), new NDomain(-maxY, -minY));
  }
}
