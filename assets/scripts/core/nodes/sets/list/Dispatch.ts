
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class Dispatch extends NodeBase {
  public get displayName (): string {
    return 'Dispatch';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to dispatch', DataTypes.ANY, AccessTypes.LIST);
    manager.add('p', 'Pattern', DataTypes.BOOLEAN, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('A', 'Culled list', DataTypes.ANY, AccessTypes.LIST);
    manager.add('B', 'Rest list', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    const pattern = access.getDataList(1) as boolean[];

    const culled = [];
    const rest = [];
    for (let i = 0, n = list.length, m = pattern.length; i < n; i++) {
      if (pattern[i % m]) {
        culled.push(list[i]);
      } else {
        rest.push(list[i]);
      }
    }
    access.setDataList(0, culled);
    access.setDataList(1, rest);
  }
}
