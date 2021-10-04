
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import XorShift from '../../../math/misc/XorShift';
import NDomain from '../../../math/primitive/NDomain';
import NodeBase from '../../NodeBase';

export default class Random extends NodeBase {
  public get displayName (): string {
    return 'Random';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('d', 'Domain of random numeric range', DataTypes.NUMBER | DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([1.0]));
    manager.add('n', 'Number of random values', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
    manager.add('s', 'Seed of random values', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Random values', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const domain = access.getData(0);
    const count = access.getData(1) as number;
    const seed = access.getData(2) as number;

    const rnd = new XorShift(seed);
    const n = Math.floor(count);

    const sequence: number[] = [];
    if (domain instanceof NDomain) {
      for (let i = 0; i < n; i++) {
        sequence.push(rnd.randFloat(domain.start, domain.end));
      }
    } else {
      for (let i = 0; i < n; i++) {
        sequence.push(rnd.randFloat(0, domain));
      }
    }
    access.setDataList(0, sequence);
  }
}
