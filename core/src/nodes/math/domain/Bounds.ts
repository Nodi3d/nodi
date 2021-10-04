import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

import { NDomain } from '../../../math/primitive/NDomain';

export class Bounds extends NodeBase {
  get displayName (): string {
    return 'Bounds';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Input values', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('d', 'Resulting domain', DataTypes.DOMAIN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const inputs = access.getDataList(0) as number[];

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    inputs.forEach((v: number) => {
      min = Math.min(v, min);
      max = Math.max(v, max);
    });
    access.setData(0, new NDomain(min, max));
  }
}
