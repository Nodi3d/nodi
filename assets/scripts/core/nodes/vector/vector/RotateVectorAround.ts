
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class RotateVectorAround extends NodeBase {
  get displayName (): string {
    return 'VRot';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('v', 'Vector to rotate', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('ax', 'Rotation axis', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(1, 0, 0)]));
    manager.add('a', 'Rotation angle in radians', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('v', 'Rotated vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const v = access.getData(0) as Vector3;
    const axis = access.getData(1) as Vector3;
    const angle = access.getData(2) as number;
    access.setData(0, v.clone().applyAxisAngle(axis.clone().normalize(), angle));
  }
}
