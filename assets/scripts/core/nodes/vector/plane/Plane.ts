
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Plane extends NodeBase {
  get displayName (): string {
    return 'Plane';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Origin of plane', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('x', 'X-Axis direction of plane', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(1, 0, 0)]));
    manager.add('y', 'Y-Axis direction of plane', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(0, 1, 0)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Constructed plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const o = access.getData(0) as NPoint;
    const x = access.getData(1) as Vector3;
    const y = access.getData(2) as Vector3;
    const normal = new Vector3().crossVectors(x, y);

    // Force linear independent vectors
    const ny = x.clone().cross(normal).normalize();
    access.setData(0, new NPlane(o, x, ny, normal));
  }
}
