import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NNurbsCurve from '../../../math/geometry/curve/NNurbsCurve';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NDomain from '../../../math/primitive/NDomain';
import NodeBase from '../../NodeBase';

type DivisionPoint = {
  point: NPoint;
  tangent: Vector3;
  t: number;
};

export default class DivideCurve extends NodeBase {
  get displayName (): string {
    return 'Divide Curve';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to divide', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('s', 'Number of segments', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Division points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('t', 'Tangent vectors at division points', DataTypes.VECTOR, AccessTypes.LIST);
    manager.add('n', 'Parameter values at division points', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0);
    const count = access.getData(1);

    const divisions = this.divide(curve, count);
    access.setDataList(0, divisions.map(d => d.point));
    access.setDataList(1, divisions.map(d => d.tangent));
    access.setDataList(2, divisions.map(d => d.t));
  }

  private divide (curve: NCurve, segments: number): DivisionPoint[] {
    const n = Math.floor(segments);

    const nurbs = curve.toNurbsCurve();
    const length = curve.length();
    // const length = nurbs.length();
    const unit = length / n;
    const domain = nurbs.domain();
    const parameters = nurbs.divideByArcLength(unit);

    const m = parameters.length;
    if (m <= n) {
      parameters.push(domain.end);
    } else if (m > n + 1) {
      parameters.pop();
    }

    if (curve.closed) {
      parameters.pop();
    }

    // console.log(curve.constructor.name, curve.closed, parameters.length, n);

    return parameters.map((t, idx) => {
      if (idx >= n - 1) {
        t -= 1e-5;
      }
      const point = nurbs.getPointAt(t);
      const tangent = nurbs.getTangentAt(t);
      return {
        point,
        tangent,
        t
      };
    });

    /*
    const domain = curve.domain();
    for (let i = 0; i < count; i++) {
      const t = domain.map(i * inv);
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      points.push({
        point,
        tangent,
        t
      });
    }
    return points;
    */
  }
}
