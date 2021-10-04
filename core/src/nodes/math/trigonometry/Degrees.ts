import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { Rad2Deg } from '../../../math/Constant';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class Degrees extends NodeBase {
  get displayName (): string {
    return 'Degrees';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('r', 'Angle in radians', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('d', 'Angle in degrees', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const n = access.getData(0) as number;
    access.setData(0, n * Rad2Deg);
  }
}
