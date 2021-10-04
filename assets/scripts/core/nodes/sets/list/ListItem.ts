
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import VariableOutputNodeBase from '../../VariableOutputNodeBase';

export default class ListItem extends VariableOutputNodeBase {
  protected createOutput (manager: OutputManager, index: number): void {
    manager.add('o', `Item at ${index <= 0 ? 'i' : 'i + ' + index}`, DataTypes.ANY, AccessTypes.ITEM);
  }

  protected getDefaultOutputCount (): number {
    return 1;
  }

  public getMinOutputCount (): number {
    return 1;
  }

  public getMaxOutputCount (): number {
    return 10;
  }

  public get displayName (): string {
    return 'Item';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'Base list', DataTypes.ANY, AccessTypes.LIST);
    manager.add('i', 'Index', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Item at i', DataTypes.ANY, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    const index = access.getData(1) as any;
    const len = list.length;

    const n = access.getOutputCount();
    for (let i = 0; i < n; i++) {
      const idx = Math.min(len - 1, index + i);
      access.setData(i, list[Math.floor(idx)]);
    }
  }
}
