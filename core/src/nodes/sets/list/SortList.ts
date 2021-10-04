
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class SortList extends NodeBase {
  public get displayName (): string {
    return 'Sort List';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('k', 'Sort keys', DataTypes.NUMBER, AccessTypes.LIST);
    manager.add('v', 'Values to sort', DataTypes.ANY, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('k', 'Sorted keys', DataTypes.NUMBER, AccessTypes.LIST);
    manager.add('v', 'Sorted values', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const keys = access.getDataList(0) as number[];
    const values = access.getDataList(1) as any[];

    const pairs = values.map((v, i) => {
      return {
        key: keys[i],
        value: v
      };
    });

    // Sort by ascending
    const result = pairs.sort((a, b) => {
      return a.key - b.key;
    });
    access.setDataList(0, result.map(r => r.key));
    access.setDataList(1, result.map(r => r.value));
  }
}
