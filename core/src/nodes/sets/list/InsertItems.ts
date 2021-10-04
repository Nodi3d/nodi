
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class InsertItems extends NodeBase {
  public get displayName (): string {
    return 'InsertItems';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to modify', DataTypes.ANY, AccessTypes.LIST);
    manager.add('i', 'Items to insert. If no items are supplied, nulls will be inserted', DataTypes.ANY, AccessTypes.LIST);
    manager.add('i', 'Insertion index for each item', DataTypes.NUMBER, AccessTypes.LIST);
    manager.add('w', 'If true, indices will be wrapped', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('l', 'Modified list', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    const items = access.getDataList(1) as any[];
    const indices = access.getDataList(2) as number[];
    const wrap = access.getData(3) as boolean;

    if (items.length !== indices.length) {
      throw new Error('# of items to insert & # of indices are not the same.');
    }

    const result = list.slice();

    for (let i = 0, n = items.length; i < n; i++) {
      const item = items[i];
      let index = indices[i];
      for (let j = 0; j < i; j++) {
        if (indices[i] < index) {
          index++;
        }
      }

      const len = result.length;
      if (index <= len) {
        result.splice(index, 0, item);
      } else if (wrap) {
        result.splice(index % (len + 1), 0, item);
      } else {
        const count = index - len;
        for (let k = 0; k < count; k++) {
          result.push(null);
        }
        result.push(item);
      }
    }

    access.setDataList(0, result);
  }
}
