
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class CullIndex extends NodeBase {
  public get displayName (): string {
    return 'Cull Index';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to cull', DataTypes.ANY, AccessTypes.LIST);
    manager.add('i', 'Culling indices', DataTypes.NUMBER, AccessTypes.LIST).setDefault(new DataTree().add([0]));
    manager.add('w', 'Wrap indices to list range', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Culled list', DataTypes.ANY, AccessTypes.LIST);
    manager.add('r', 'Rest list', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    const indices = access.getDataList(1) as number[];
    const wrap = access.getData(2) as boolean;

    const culled = [];
    const rest = [];
    for (let i = 0, n = list.length; i < n; i++) {
      if (!indices.includes(i)) {
        const idx = (wrap) ? (i % n) : i;
        if (idx < n) {
          culled.push(list[idx]);
        }
      } else {
        rest.push(list[i]);
      }
    }

    access.setDataList(0, culled);
    access.setDataList(1, rest);
  }
}
