
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class PartitionList extends NodeBase {
  public get displayName (): string {
    return 'Partition';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to partition', DataTypes.ANY, AccessTypes.LIST);
    manager.add('s', 'Size of partitions', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('l', 'List chunks', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const values = access.getDataList(0) as any[];
    const sizes = access.getDataList(1) as number[];

    const result = [];
    const n = values.length;
    const m = sizes.length;
    for (let i = 0; i < n;) {
      for (let j = 0; j < m && i < n; j++) {
        const size = sizes[j];
        const l = i + size;

        const array = [];
        for (let k = i; k < l && k < n; k++) {
          array.push(values[k]);
        }
        result.push(array);

        i = l;
      }
    }

    access.setDataList(0, result);
  }
}
