import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class GateNot extends NodeBase {
  get displayName (): string {
    return '¬';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Boolean value', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Inverse of inputs', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    access.setData(0, !access.getData(0));
  }
}
