import FrepBase from '../../core/math/frep/FrepBase';

export default class NVFrep {
  public get entity () {
    return this.frep;
  }

  private frep: FrepBase;

  constructor (frep: FrepBase) {
    this.frep = frep;
  }

  public compile (p: string): string {
    return this.frep.compile(p);
  }
}
