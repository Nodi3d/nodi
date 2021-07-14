
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class Duplicate extends NodeBase {
  public get displayName (): string {
    return 'Duplicate';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('d', 'Data to duplicate', DataTypes.ANY, AccessTypes.ITEM);
    manager.add('n', 'Number of duplicates', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Duplicated data list', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const data = access.getData(0);
    const count = access.getData(1) as number;
    const n = Math.floor(count);

    const duplicates: number[] = [];
    for (let i = 0; i < n; i++) {
      duplicates.push(data);
    }
    access.setDataList(0, duplicates);
  }
}
