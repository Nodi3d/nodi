import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class Relay extends NodeBase {
  public get displayName (): string {
    return 'Relay';
  }

  public get minHeight (): number {
    return 26;
  }

  public get flowable (): boolean {
    return false;
  }

  public get previewable (): boolean {
    return false;
  }

  public setupViewElement (container: HTMLDivElement): void {
    container.style.padding = '0px 16px';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Input value', DataTypes.ANY, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Output value (through)', DataTypes.ANY, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const input = access.getData(0);
    access.setData(0, input);
  }
}
