
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class ReverseList extends NodeBase {
  public get displayName (): string {
    return 'Reverse List';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to reverse', DataTypes.ANY, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('l', 'Reversed list', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    access.setDataList(0, list.reverse());
  }
}
