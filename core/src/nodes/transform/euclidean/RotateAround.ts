
import { Matrix4, Quaternion, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPoint } from '../../../math/geometry/NPoint';
import { isTransformable } from '../../../math/geometry/ITransformable';
import { NodeBase } from '../../NodeBase';

export class RotateAround extends NodeBase {
  get displayName (): string {
    return 'Rotate Around';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('a', 'Rotation angle in radians', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('p', 'Center of rotation', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint(0, 0, 0)]));
    manager.add('v', 'Axis of rotation', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(1, 0, 0)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Rotated geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const angle = access.getData(1) as number;
    const center = access.getData(2) as NPoint;
    const axis = access.getData(3) as Vector3;
    const m = this.getRotatePointMatrix(angle, center, axis);
    if (isTransformable(geometry)) {
      const result = geometry.applyMatrix(m);
      access.setData(0, result);
    }
  }

  private getRotatePointMatrix (angle: number, center: NPoint, axis: Vector3) {
    const T = (new Matrix4()).makeTranslation(center.x, center.y, center.z);
    const IT = (new Matrix4()).makeTranslation(-center.x, -center.y, -center.z);
    const q = new Quaternion();
    q.setFromAxisAngle(axis, angle);
    const R = (new Matrix4()).makeRotationFromQuaternion(q);

    const m = new Matrix4();
    m.multiply(T);
    m.multiply(R);
    m.multiply(IT);
    return m;
  }
}
