import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NNurbsCurve from '../../../math/geometry/curve/NNurbsCurve';
import NodeBase from '../../NodeBase';

export default class DivideLength extends NodeBase {
  get displayName (): string {
    return 'Divide Length';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to divide', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('s', 'Length of segments', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Division points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('t', 'Tangent vectors at division points', DataTypes.VECTOR, AccessTypes.LIST);
    manager.add('n', 'Parameter values at division points', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const unit = access.getData(1);
    if (unit <= 0.0) {
      throw new Error('the input length is less than 0.');
    }

    const nurbs = curve.toNurbsCurve();
    const parameters = nurbs.divideByArcLength(unit);

    const points = parameters.map((t) => {
      return nurbs.getPointAt(t);
    });

    const tangents = parameters.map((t) => {
      return nurbs.getTangentAt(t);
    });

    access.setDataList(0, points);
    access.setDataList(1, tangents);
    access.setDataList(2, parameters);
  }
}
