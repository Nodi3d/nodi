
import { AccessTypes } from '../../data/AccessTypes';
import { DataAccess } from '../../data/DataAccess';
import { DataTypes } from '../../data/DataTypes';
import { InputManager } from '../../io/InputManager';
import { OutputManager } from '../../io/OutputManager';
import { NodeBase } from '../NodeBase';

export class UnGroup extends NodeBase {
  get displayName (): string {
    return 'UnGroup';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Group to ungroup', DataTypes.GROUP, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Objects in group', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const group = access.getData(0);
    access.setDataList(0, group.objects);
  }
}
