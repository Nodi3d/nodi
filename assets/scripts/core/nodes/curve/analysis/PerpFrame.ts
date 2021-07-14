import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPlane from '../../../math/geometry/NPlane';
import NodeBase from '../../NodeBase';

export default class PerpFrame extends NodeBase {
  get displayName (): string {
    return 'PFrame';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to evaluate', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Parameter on curve domain to evaluate', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Perpendicular curve frame on the curve at {t}', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const t = access.getData(1) as number;
    const u = (t <= 0.0) ? 0.0 : (t / curve.length());
    if (u > 1.0) {
      throw new Error('Input parameter is out of curve domain');
    }
    const origin = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u);
    access.setData(0, NPlane.fromOriginNormal(origin, tangent));
  }
}
