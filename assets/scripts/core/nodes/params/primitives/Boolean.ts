import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class Boolean extends NodeBase {
  public get displayName (): string {
    return 'Bool';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Input value', DataTypes.NUMBER | DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([true]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('b', 'Resulting bool', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const input = access.getData(0);
    let result = true;
    if (typeof (input) === 'number') {
      result = input > 0;
    } else {
      result = input;
    }
    access.setData(0, result);
  }
}
