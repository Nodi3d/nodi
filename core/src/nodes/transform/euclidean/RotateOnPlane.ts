
import { Matrix4, Quaternion, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { isTransformable } from '../../../math/geometry/ITransformable';
import { NodeBase } from '../../NodeBase';

export class RotateOnPlane extends NodeBase {
  get displayName (): string {
    return 'Rotate On Plane';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('a', 'Rotation angle in radians', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('p', 'Base plane', DataTypes.POINT | DataTypes.PLANE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Rotated geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const angle = access.getData(1) as number;
    const pivot = access.getData(2) as (NPoint | NPlane);
    let plane: NPlane;
    if (pivot instanceof Vector3) {
      plane = new NPlane(pivot);
    } else {
      plane = pivot;
    }
    const m = this.getRotateOnPlaneMatrix(angle, plane);
    if (isTransformable(geometry)) {
      const result = geometry.applyMatrix(m);
      access.setData(0, result);
    }
  }

  private getRotateOnPlaneMatrix (angle: number, plane: NPlane) {
    const center = plane.origin;
    const axis = plane.normal.normalize();
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
