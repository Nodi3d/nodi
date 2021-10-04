import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

import NDomain from '../../../math/primitive/NDomain';
import DataTree from '../../../data/DataTree';

export default class ConsecutiveDomains extends NodeBase {
  get displayName (): string {
    return 'Consec';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Numbers for consecutive domains', DataTypes.NUMBER, AccessTypes.LIST);
    manager.add('b', 'If True, values are added to a sum-total', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('d', 'Domains describing the spaces between the numbers', DataTypes.DOMAIN, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const numbers = access.getDataList(0) as number[];
    const addition = access.getData(1) as boolean;

    const domains: NDomain[] = [];
    if (addition) {
      let offset = (numbers.length > 0) ? numbers[0] : 0;
      for (let i = 0, n = numbers.length - 1; i < n; i++) {
        const n0 = offset;
        const n1 = offset + numbers[i + 1];
        const d = new NDomain(Math.min(n0, n1), Math.max(n0, n1));
        domains.push(d);
        offset = n1;
      }
    } else {
      for (let i = 0, n = numbers.length - 1; i < n; i++) {
        const n0 = numbers[i];
        const n1 = numbers[i + 1];
        domains.push(new NDomain(Math.min(n0, n1), Math.max(n0, n1)));
      }
    }
    access.setDataList(0, domains);
  }
}
