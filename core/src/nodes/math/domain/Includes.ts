import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NDomain } from '../../../math/primitive/NDomain';
import { NodeBase } from '../../NodeBase';

export class Includes extends NodeBase {
  get displayName (): string {
    return 'Inc';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('n', 'Value to test for inclusion', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('d', 'Domain to test with', DataTypes.DOMAIN, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('b', 'True if the value is included in the domain', DataTypes.BOOLEAN, AccessTypes.ITEM);
    manager.add('d', 'Distance between the value and the nearest value inside the domain', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const n = access.getData(0) as number;
    const domain = access.getData(0) as NDomain;
    access.setData(0, domain.includes(n));
    access.setData(1, domain.distance(n));
  }
}
