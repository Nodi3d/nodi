import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class Maximum extends NodeBase {
  get displayName (): string {
    return 'Max';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('a', 'First item for comparison', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('b', 'Second item for comparison', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'The larger item', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as number;
    const b = access.getData(1) as number;

    access.setData(0, Math.max(a, b));
  }
}
