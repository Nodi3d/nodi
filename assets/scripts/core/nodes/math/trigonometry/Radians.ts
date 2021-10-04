import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { Deg2Rad } from '../../../math/Constant';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import DataTree from '../../../data/DataTree';

export default class Radians extends NodeBase {
  get displayName (): string {
    return 'Radians';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('d', 'Angle in degrees', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('r', 'Angle in radians', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const n = access.getData(0) as number;
    access.setData(0, n * Deg2Rad);
  }
}
