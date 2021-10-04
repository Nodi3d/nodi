import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NodeBase from '../../NodeBase';

export default class EvaluateCurve extends NodeBase {
  get displayName (): string {
    return 'Evaluate Curve';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to evaluate', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Parameter on curve domain to evaluate (0.0 ~ 1.0)', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Point on the curve at {t}', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('t', 'Tangent vector on the curve at {t}', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const t01 = access.getData(1) as number;
    const nurbs = curve.toNurbsCurve();
    const domain = curve.domain();
    access.setData(0, nurbs.getPointAt(domain.map(t01)));
    access.setData(1, nurbs.getTangentAt(domain.map(t01)));
  }
}
