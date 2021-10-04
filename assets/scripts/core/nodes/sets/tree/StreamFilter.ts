
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import VariableInputNodeBase from '../../VariableInputNodeBase';

export default class StreamFilter extends VariableInputNodeBase {
  protected createInput (manager: InputManager, index: number): void {
    manager.add(`${index}`, `Input stream at index ${index}th`, DataTypes.ANY, AccessTypes.TREE).setOptional(true);
  }

  protected getDefaultInputCount (): number {
    return 2;
  }

  public getMinInputCount (): number {
    return 2;
  }

  public getMaxInputCount (): number {
    return 10;
  }

  public get displayName (): string {
    return 'Filter';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Index of Gate stream', DataTypes.NUMBER | DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    const n = this.getDefaultInputCount();
    for (let i = 0; i < n; i++) {
      this.createInput(manager, i);
    }
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('s', 'Filtered stream', DataTypes.ANY, AccessTypes.TREE);
  }

  public solve (access: DataAccess): void {
    const v = access.getData(0);
    let index = 0;
    if ((typeof v) === 'boolean') {
      if (v) {
        index = 1;
      } else {
        index = 0;
      }
    } else {
      index = v as number;
    }

    const length = access.getInputCount() - 1;
    index = (Math.floor(index) % length + 1);
    if (index < 1) {
      throw new Error('Index of Gate must be larger than 0');
    }

    const result = access.getDataTree(index);
    access.setDataTree(0, result);
  }
}
