
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class Vector extends NodeBase {
  get displayName (): string {
    return 'V';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('x', 'X component of vector', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('y', 'Y component of vector', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('z', 'Z component of vector', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('v', 'Vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const x = access.getData(0);
    const y = access.getData(1);
    const z = access.getData(2);
    access.setData(0, new Vector3(x, y, z));
  }
}
