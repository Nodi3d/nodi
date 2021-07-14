
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import NodeBase from '../../NodeBase';

export default class FlipPlane extends NodeBase {
  get displayName (): string {
    return 'PFlip';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Plane to adjust', DataTypes.PLANE, AccessTypes.ITEM);
    manager.add('x', 'Reverse the x-axis direction', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
    manager.add('y', 'Reverse the y-axis direction', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
    manager.add('s', 'Swap the x & y axis directions', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([true]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Flipped plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const rx = access.getData(1) as boolean;
    const ry = access.getData(2) as boolean;
    const rswap = access.getData(3) as boolean;
    access.setData(0, plane.flip(rx, ry, rswap));
  }
}
