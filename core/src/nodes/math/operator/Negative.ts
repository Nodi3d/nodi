import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class Negative extends NodeBase {
  get displayName (): string {
    return '-x';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('x', 'Input value', DataTypes.NUMBER | DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Negated value', DataTypes.NUMBER | DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const x = access.getData(0);
    if (x instanceof Vector3) {
      access.setData(0, x.clone().multiplyScalar(-1));
    } else {
      access.setData(0, -(x as number));
    }
  }
}
