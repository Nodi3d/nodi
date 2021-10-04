import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

import { NDomain } from '../../../math/primitive/NDomain';

export class DeconstructDomain extends NodeBase {
  get displayName (): string {
    return 'DeDomain';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Base domain', DataTypes.DOMAIN, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('s', 'Start value of domain', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('e', 'End value of domain', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const domain = access.getData(0) as NDomain;
    access.setData(0, domain.start);
    access.setData(1, domain.end);
  }
}
