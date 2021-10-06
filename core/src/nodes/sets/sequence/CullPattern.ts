
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class CullPattern extends NodeBase {
  public get displayName (): string {
    return 'Cull Pattern';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('l', 'List to cull', DataTypes.ANY, AccessTypes.LIST);
    manager.add('p', 'Culling pattern', DataTypes.BOOLEAN, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Culled list', DataTypes.ANY, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const list = access.getDataList(0) as any[];
    const pattern = access.getDataList(1) as boolean[];

    const culled = [];
    for (let i = 0, n = list.length, m = pattern.length; i < n; i++) {
      if (pattern[i % m]) {
        culled.push(list[i]);
      }
    }
    access.setDataList(0, culled);
  }
}
