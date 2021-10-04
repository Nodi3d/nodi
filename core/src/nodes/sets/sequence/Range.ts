
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NDomain } from '../../../math/primitive/NDomain';
import { NodeBase } from '../../NodeBase';

export class Range extends NodeBase {
  public get displayName (): string {
    return 'Random';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('d', 'Domain of numeric range', DataTypes.NUMBER | DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(0.0, 1.0)]));
    manager.add('n', 'Number of steps', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Range numbers', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const domain = access.getData(0);
    const count = access.getData(1) as number;
    const n = Math.floor(count);

    let min = 0;
    let max = 1;
    const sequence: number[] = [];
    if (domain instanceof NDomain) {
      min = domain.start;
      max = domain.end;
    } else {
      min = 0;
      max = domain;
    }
    const interval = max - min;
    const inv = 1 / n * interval;
    for (let i = 0; i < n; i++) {
      sequence.push(min + i * inv);
    }
    sequence.push(max);
    access.setDataList(0, sequence);
  }
}
