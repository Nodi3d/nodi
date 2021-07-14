
export default class XorShift {
  private w: number;
  private x: number;
  private y: number;
  private z: number;

  constructor (w = 0, x = 123456789, y = 362436069, z = 521288629) {
    this.w = w + 1;
    this.x = 0 | this.w << 13;
    this.y = 0 | (this.w >>> 9) ^ (this.x << 6);
    this.z = 0 | this.y >>> 7;
  }

  public next (): number {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    return (this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)))) >>> 0;
  }

  public rand (): number {
    return this.next();
  }

  public randInt (min: number = 0, max: number = 0x7FFFFFFF): number {
    const r = Math.abs(this.rand());
    return r % (max - min) + min;
  }

  public randFloat (min: number = 0, max: number = 1): number {
    return Math.fround(this.rand() % 0xFFFF / 0xFFFF) * (max - min) + min;
  }

  public shuffle (_arr: any[]): any[] {
    const arr = _arr.concat();
    for (let i = 0; i <= arr.length - 2; i = 0 | i + 1) {
      const r = this.randInt(i, arr.length - 1);
      const tmp = arr[i];
      arr[i] = arr[r];
      arr[r] = tmp;
    }
    return arr;
  }
}
