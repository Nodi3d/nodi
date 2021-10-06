
import { AccessTypes } from '../../data/AccessTypes';
import { DataAccess } from '../../data/DataAccess';
import { DataTypes } from '../../data/DataTypes';
import { InputManager } from '../../io/InputManager';
import { OutputManager } from '../../io/OutputManager';
import { NodeBase } from '../NodeBase';
import { NGroup } from '../../math/primitive/NGroup';

  export class Group extends NodeBase {
    get displayName (): string {
    return 'Group';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Objects to group', DataTypes.ANY, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Resulting group', DataTypes.GROUP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const objects = access.getDataList(0);
    access.setData(0, new NGroup(objects.slice()));
  }
}
