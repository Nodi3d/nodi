import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class Equality extends NodeBase {
  get displayName (): string {
    return 'Equality';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('A', 'Compare', DataTypes.NUMBER | DataTypes.BOOLEAN, AccessTypes.ITEM);
    manager.add('B', 'Compare to', DataTypes.NUMBER | DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('=', 'Equal', DataTypes.BOOLEAN, AccessTypes.ITEM);
    manager.add('≠', 'Not equal', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const i0 = access.getData(0);
    const i1 = access.getData(1);
    const result = i0 === i1;
    access.setData(0, result);
    access.setData(1, !result);
  }
}
