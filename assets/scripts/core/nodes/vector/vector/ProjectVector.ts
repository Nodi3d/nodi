
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import NodeBase from '../../NodeBase';

export default class ProjectVector extends NodeBase {
  get displayName (): string {
    return 'VProj';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('v', 'Vector to project', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('p', 'Vector representing a plane normal.', DataTypes.VECTOR | DataTypes.PLANE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('v', 'Projected vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const v = access.getData(0) as Vector3;
    const plane = access.getData(1);
    let normal: Vector3;
    if (plane instanceof Vector3) {
      normal = plane;
    } else {
      normal = (plane as NPlane).normal;
    }
    access.setData(0, v.clone().projectOnPlane(normal));
  }
}
