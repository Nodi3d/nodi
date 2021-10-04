
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class ItemIndex extends NodeBase {
  public get displayName (): string {
    return 'Index';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to serarch', DataTypes.ANY, AccessTypes.LIST);
    manager.add('l', 'Item to search for', DataTypes.ANY, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('i', 'The index of item in the list, -1 if not found', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    const item = access.getData(1) as any;
    const index = list.indexOf(item);
    access.setData(0, index);
  }
}
