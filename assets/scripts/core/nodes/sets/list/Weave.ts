
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import VariableInputNodeBase from '../../VariableInputNodeBase';

export default class Weave extends VariableInputNodeBase {
  public get displayName (): string {
    return 'Weave';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Pattern as list', DataTypes.NUMBER, AccessTypes.LIST);
    const count = this.getDefaultInputCount();
    for (let i = 0; i < count; i++) {
      this.createInput(manager, i);
    }
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Weave result', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const pattern = access.getDataList(0) as number[];
    const count = access.getInputCount();
    const arrays: any[][] = [];
    for (let i = 1; i < count; i++) {
      arrays.push(access.getDataList(i));
    }

    const result: any[] = [];
    while (true) {
      let empty = true;
      pattern.forEach((idx) => {
        if (idx < arrays.length) {
          const arr = arrays[idx];
          const emp = (arr.length <= 0);
          if (!emp) {
            result.push(arr.shift());
          }
          empty = empty && emp;
        }
      });
      if (empty) { break; }
    }
    access.setDataList(0, result);
  }

  protected createInput (manager: InputManager, index: number): void {
    manager.add(`${index}th`, `Input stream at index ${index}`, DataTypes.ANY, AccessTypes.LIST).setOptional(true);
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
