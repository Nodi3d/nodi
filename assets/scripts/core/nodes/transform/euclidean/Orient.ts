
import { Matrix4, Quaternion, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import { isTransformable } from '../../../math/geometry/ITransformable';
import NodeBase from '../../NodeBase';

export default class Orient extends NodeBase {
  get displayName (): string {
    return 'Orient';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('a', 'Initial plane', DataTypes.PLANE, AccessTypes.ITEM);
    manager.add('b', 'Final plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Oriented geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const a = access.getData(1) as NPlane;
    const b = access.getData(2) as NPlane;
    const m = this.getOrientMatrix(a, b);
    if (isTransformable(geometry)) {
      const result = geometry.applyMatrix(m);
      access.setData(0, result);
    }
  }

  private getOrientMatrix (a: NPlane, b: NPlane) {
    const m1 = new Matrix4();
    m1.lookAt(a.origin, a.origin.clone().add(a.normal), a.yAxis);
    let q1 = new Quaternion();
    q1.setFromRotationMatrix(m1);
    q1 = q1.invert();

    const m2 = new Matrix4();
    m2.lookAt(b.origin, b.origin.clone().add(b.normal), b.yAxis);
    const q2 = new Quaternion();
    q2.setFromRotationMatrix(m2);

    const m = new Matrix4();
    const sub = (new Matrix4()).makeTranslation(-a.origin.x, -a.origin.y, -a.origin.z);
    const r1 = (new Matrix4()).makeRotationFromQuaternion(q1);
    const r2 = (new Matrix4()).makeRotationFromQuaternion(q2);
    const add = (new Matrix4()).makeTranslation(b.origin.x, b.origin.y, b.origin.z);
    m.multiply(add);
    m.multiply(r2);
    m.multiply(r1);
    m.multiply(sub);
    return m;
  }
}
