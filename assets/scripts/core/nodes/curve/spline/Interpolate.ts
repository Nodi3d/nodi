
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NNurbsCurve from '../../../math/geometry/curve/NNurbsCurve';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Interpolate extends NodeBase {
  get displayName (): string {
    return 'Interpolate';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Interpolation points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('d', 'Curve degree', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([3]));
    manager.add('p', 'Periodic curve', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting nurbs arc', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('l', 'Curve length', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const points = access.getDataList(0) as NPoint[];
    const degree = access.getData(1) as number;
    const periodic = access.getData(2) as boolean;

    const inputs = points.slice();
    const closed = (points.length > 0 && periodic);
    if (closed) {
      const first = inputs[0];
      const last = inputs[inputs.length - 1];
      if (first.distanceTo(last) > 1e-10) { // check duplicated
        inputs.push(first);
      }
    }

    const curve = NNurbsCurve.byPoints(inputs, Math.min(degree, points.length - 1));

    access.setData(0, curve);
    access.setData(1, curve.length());
  }
}
