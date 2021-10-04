
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class ShiftList extends NodeBase {
  public get displayName (): string {
    return 'Shift List';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to shift', DataTypes.ANY, AccessTypes.LIST);
    manager.add('o', 'Offset', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('w', 'Wrap', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([true]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('l', 'Shifted list', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    const offset = access.getData(1) as number;
    const wrap = access.getData(2) as boolean;

    const len = list.length;
    const ioffset = Math.floor(offset);
    const result = [];
    for (let i = 0; i < len; i++) {
      let idx = i + ioffset;
      if (!wrap && (idx < 0 || idx >= len)) { continue; }

      if (idx < 0) {
        idx = len + idx;
      } else if (idx >= len) {
        idx = idx % len;
      }
      result.push(list[idx]);
    }

    access.setDataList(0, result);
  }
}
