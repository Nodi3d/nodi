
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { VariableInputNodeBase } from '../../VariableInputNodeBase';

export class Merge extends VariableInputNodeBase {
  public get displayName (): string {
    return 'Merge';
  }

  public constructor (uuid: string) {
    super(uuid);

    this.inputManager.onConnectIO.on((e) => {
      const { io } = e;
      const idx = this.inputManager.getIOIndex(io);
      const n = this.inputManager.getIOCount();
      if (idx >= n - 1) {
        this.setInputCount(n + 1);
      }
    });
  }

  public registerInputs (manager: InputManager): void {
    const count = this.getDefaultInputCount();
    for (let i = 0; i < count; i++) {
      this.createInput(manager, i);
    }
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Merged output', DataTypes.ANY, AccessTypes.TREE);
  }

  protected createInput (manager: InputManager, index: number) {
    manager.add(`${index}`, `${index}th target`, DataTypes.ANY, AccessTypes.TREE).setOptional(true);
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

  public solve (access: DataAccess): void {
    let result = access.getDataTree(0).clone();
    const n = Math.min(this.getInputCount(), access.getInputCount());
    for (let i = 1; i < n; i++) {
      const other = access.getDataTree(i);
      result = result.merge(other);
    }
    access.setDataTree(0, result);
  }
}
