
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class DeconstructPoint extends NodeBase {
  get displayName (): string {
    return 'DePoint';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Input point', DataTypes.POINT, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('x', 'X component of a point', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('y', 'Y component of a point', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('z', 'Z component of a point', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const point = access.getData(0) as NPoint;

    access.setData(0, point.x);
    access.setData(1, point.y);
    access.setData(2, point.z);
  }
}
