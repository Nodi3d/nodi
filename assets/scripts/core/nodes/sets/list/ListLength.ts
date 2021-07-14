
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class ListLength extends NodeBase {
  public get displayName (): string {
    return 'Lng';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List', DataTypes.ANY, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('n', 'Number of items', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    access.setData(0, list.length);
  }
}
