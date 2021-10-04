
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class Series extends NodeBase {
  public get displayName (): string {
    return 'Series';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('Start', 'Start', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('Step', 'Step', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('Count', 'Count', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'The result of operation', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const start = access.getData(0);
    const step = access.getData(1);
    const count = access.getData(2);

    const series = [];
    for (let i = 0; i < count; i++) {
      series.push(start + i * step);
    }
    access.setDataList(0, series);
  }
}
