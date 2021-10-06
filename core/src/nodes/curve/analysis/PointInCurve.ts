import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { isClosedCurve } from '../../../math/geometry/curve/IClosedCurve';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class PointInCurve extends NodeBase {
  get displayName (): string {
    return 'PointInCurve';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Point for region inclusion test', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('c', 'Boundary region (closed curves only)', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'a point is inside a curve or not', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const point = access.getData(0) as NPoint;
    const curve = access.getData(1) as NCurve;
    if (isClosedCurve(curve)) {
      access.setData(0, curve.contains(point));
    } else {
      throw new Error('Input curve is not closed curve.');
    }
  }
}
