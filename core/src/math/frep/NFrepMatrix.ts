import { Matrix4, Quaternion, Vector3 } from 'three';
import { TransformerType, ITransformable } from '../geometry/ITransformable';
import { NFrepBase } from './NFrepBase';
import { NFrepFilter } from './NFrepFilter';

export class NFrepMatrix extends NFrepBase {
  private frep: NFrepBase;
  private matrix: Matrix4;

  constructor (frep: NFrepBase, matrix: Matrix4) {
    super();
    this.frep = frep;
    this.matrix = matrix;
    this.boundingBox = this.frep.boundingBox.applyMatrix(this.matrix);
  }

  public static create (frep: NFrepBase, position: Vector3 = new Vector3(0, 0, 0), rotation: Quaternion = new Quaternion(), scale: Vector3 = new Vector3(1, 1, 1)): NFrepMatrix {
    const T = (new Matrix4()).makeTranslation(position.x, position.y, position.z);
    const R = (new Matrix4()).makeRotationFromQuaternion(rotation);
    const S = (new Matrix4()).makeScale(scale.x, scale.y, scale.z);
    const m = new Matrix4();
    m.multiply(T);
    m.multiply(R);
    m.multiply(S);
    return new NFrepMatrix(frep, m);
  }

  applyMatrix (matrix: Matrix4): ITransformable {
    return new NFrepMatrix(this, matrix);
  }

  transform (f: TransformerType): ITransformable {
    throw new Error('Method not implemented.');
  }

  public compile (p: string = 'p'): string {
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    const u = new Vector3(1, 1, 1);

    this.matrix.decompose(position, rotation, scale);

    if (position.length() === 0 && rotation.equals(new Quaternion().identity()) && scale.equals(u)) {
      return this.frep.compile(p);
    }

    if (scale.x === 1.0 || scale.y === 1.0 || scale.z === 1.0) {
      const inversed = this.matrix.clone().invert();
      const np = `opTx(${p}, mat4(${inversed.elements.join(',')}))`;
      return this.frep.compile(np);
    }

    const factor = Math.min(scale.x, Math.min(scale.y, scale.z));
    const code = function (this: NFrepFilter, p: string) {
      const distance = this.frep.compile(`${p} / vec3(${scale.x.toFixed(2)}, ${scale.y.toFixed(2)}, ${scale.z.toFixed(2)})`);
      return `${distance} * ${factor.toFixed(2)}`;
    };
    const filter = new NFrepFilter(code, this.frep, this.boundingBox);
    const T = new Matrix4();
    T.makeTranslation(position.x, position.y, position.z);
    const R = new Matrix4();
    R.makeRotationFromQuaternion(rotation);
    const m = new Matrix4();
    m.multiply(T);
    m.multiply(R);
    const inversed = m.invert();
    const np = `opTx(${p}, mat4(${inversed.elements.map(n => n.toFixed(4)).join(',')}))`;
    return filter.compile(np);
  }
}
