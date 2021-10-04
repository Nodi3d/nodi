import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class SmallerThan extends NodeBase {
  get displayName (): string {
    return 'Smaller Than';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('A', 'Number to test', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('B', 'Number to test against', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('<', 'Test if A < B', DataTypes.BOOLEAN, AccessTypes.ITEM);
    manager.add('<=', 'Test if A <= B', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as number;
    const b = access.getData(1) as number;
    access.setData(0, a < b);
    access.setData(1, a <= b);
  }
}
