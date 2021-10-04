
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NPlane } from '../../../math/geometry/NPlane';
import { NodeBase } from '../../NodeBase';

export class LinePlaneIntersection extends NodeBase {
  get displayName (): string {
    return 'Line | Plane';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Line curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Intersection plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Intersection point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('t', 'Parameter on line curve', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const c = access.getData(0) as NCurve;
    if (!(c instanceof NLineCurve)) {
      throw new TypeError('Input curve must be line curve');
    }
    const p = access.getData(1) as NPlane;

    const result = p.findLineIntersection(c.a, c.b);
    if (result !== undefined) {
      access.setData(0, result);
      access.setData(1, c.getParameter(result));
    }
  }
}
