
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Distance extends NodeBase {
  get displayName (): string {
    return 'D';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('a', 'First point', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('b', 'Second point', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('d', 'Distance between two points', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as NPoint;
    const b = access.getData(1) as NPoint;

    access.setData(0, a.distanceTo(b));
  }
}
