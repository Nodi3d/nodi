import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NodeBase from '../../NodeBase';

export default class CurveLength extends NodeBase {
  get displayName (): string {
    return 'Curve Length';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to measure', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('l', 'Curve length', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;

    // const nurbs = curve.toNurbsCurve();
    // nurbs.length();
    access.setData(0, curve.length());
  }
}
