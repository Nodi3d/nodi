
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class DeconstructVector extends NodeBase {
  get displayName (): string {
    return 'DeVec';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('v', 'Input vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('x', 'X component of a vector', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('y', 'Y component of a vector', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('z', 'Z component of a vector', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const v = access.getData(0) as Vector3;
    access.setData(0, v.x);
    access.setData(1, v.y);
    access.setData(2, v.z);
  }
}
