import { Matrix4, Quaternion, Vector3 } from 'three';
import FrepBase from './FrepBase';
import FrepFilter from './FrepFilter';

export default class FrepMatrix extends FrepBase {
  private frep: FrepBase;
  private matrix: Matrix4;

  constructor (frep: FrepBase, matrix: Matrix4) {
    super();
    this.frep = frep;
    this.matrix = matrix;
    this.boundingBox = this.frep.boundingBox.applyMatrix(this.matrix);
  }

  public compile (p: string = 'p'): string {
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    this.matrix.decompose(position, rotation, scale);

    if (scale.x === 1.0 || scale.y === 1.0 || scale.z === 1.0) {
      const inversed = this.matrix.clone().invert();
      const np = `opTx(${p}, mat4(${inversed.elements.join(',')}))`;
      return this.frep.compile(np);
    }

    const factor = Math.min(scale.x, Math.min(scale.y, scale.z));
    const code = function (this: FrepFilter, p: string) {
      const distance = this.frep.compile(`${p} / vec3(${scale.x.toFixed(2)}, ${scale.y.toFixed(2)}, ${scale.z.toFixed(2)})`);
      return `${distance} * ${factor.toFixed(2)}`;
    };
    const filter = new FrepFilter(code, this.frep, this.boundingBox);
    const m = new Matrix4();
    const T = new Matrix4();
    T.makeTranslation(position.x, position.y, position.z);
    const R = new Matrix4();
    R.makeRotationFromQuaternion(rotation);
    m.multiply(T);
    m.multiply(R);
    const inversed = m.invert();
    const np = `opTx(${p}, mat4(${inversed.elements.map(n => n.toFixed(4)).join(',')}))`;
    return filter.compile(np);
  }
}
