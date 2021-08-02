import { Matrix4, Quaternion, Vector3 } from 'three';
import FrepBase from './FrepBase';

export default class FrepTransform extends FrepBase {
  private frep: FrepBase;
  private position: Vector3;
  private rotation: Quaternion;
  private scale: Vector3;
  private matrix: Matrix4;

  constructor (frep: FrepBase, position: Vector3 = new Vector3(0, 0, 0), rotation: Quaternion = new Quaternion(), scale: Vector3 = new Vector3(1, 1, 1)) {
    super();
    this.frep = frep;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;

    this.matrix = this.TRS();
    this.boundingBox = this.frep.boundingBox.applyMatrix(this.matrix);
  }

  private TRS (): Matrix4 {
    const mat = new Matrix4();
    const tr = (new Matrix4()).makeTranslation(this.position.x, this.position.y, this.position.z);
    const rot = (new Matrix4()).makeRotationFromQuaternion(this.rotation);
    const scale = (new Matrix4()).makeScale(this.scale.x, this.scale.y, this.scale.z);
    mat.multiply(tr);
    mat.multiply(rot);
    mat.multiply(scale);
    return mat;
  }

  public compile (p: string = 'p'): string {
    const inversed = this.matrix.clone().invert();

    const identity = new Matrix4();
    if (inversed.equals(identity)) {
      return this.frep.compile(p);
    }

    const np = `opTx(${p}, mat4(${inversed.elements.join(',')}))`;
    return this.frep.compile(np);
  }
}
