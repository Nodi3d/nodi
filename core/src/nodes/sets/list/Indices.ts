
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class Indices extends NodeBase {
  public get displayName (): string {
    return 'Indices';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List', DataTypes.ANY, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('i', 'The indices of list', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    access.setDataList(0, list.map((_, idx) => idx));
  }
}
