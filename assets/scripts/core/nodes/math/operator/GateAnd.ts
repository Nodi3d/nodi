import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import VariableInputNodeBase from '../../VariableInputNodeBase';
import DataTree from '../../../data/DataTree';

const InputDataType = DataTypes.NUMBER | DataTypes.BOOLEAN;

export default class GateAnd extends VariableInputNodeBase {
  get displayName (): string {
    return '^';
  }

  public registerInputs (manager: InputManager): void {
    const count = this.getDefaultInputCount();
    for (let i = 0; i < count; i++) {
      this.createInput(manager, i);
    }
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('r', 'Result values', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    let flag = true;
    for (let i = 0; i < this.getInputCount(); i++) {
      flag = flag && access.getData(i);
    }
    access.setData(0, flag);
  }

  protected createInput (manager: InputManager, index: number) {
    manager.add(`${index}th`, `${index}th Compare`, InputDataType, AccessTypes.ITEM).setDefault(new DataTree().add([true]));
  }

  protected getDefaultInputCount (): number {
    return 2;
  }

  public getMinInputCount (): number {
    return 2;
  }

  public getMaxInputCount (): number {
    return 8;
  }
}
