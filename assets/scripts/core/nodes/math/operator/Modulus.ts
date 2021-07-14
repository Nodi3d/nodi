import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class Modulus extends NodeBase {
  get displayName (): string {
    return '%';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('A', 'Dividend', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('B', 'Divisor', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([2]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Output value', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0);
    const b = access.getData(1);
    access.setData(0, a % b);
  }
}
