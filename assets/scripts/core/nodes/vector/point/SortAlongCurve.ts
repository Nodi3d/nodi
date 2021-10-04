
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NNurbsCurve from '../../../math/geometry/curve/NNurbsCurve';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class SortAlongCurve extends NodeBase {
  get displayName (): string {
    return 'AlongCrv';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Points to sort', DataTypes.POINT, AccessTypes.LIST);
    manager.add('c', 'Curve to sort along', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Sorted points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('i', 'Point index map', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const points = access.getDataList(0) as NPoint[];
    const curve = access.getData(1) as NCurve;

    const nurbs = curve.toNurbsCurve();
    const data = points.map((p, index) => {
      const t = nurbs.closestParam(p);
      return {
        point: p,
        index,
        t
      };
    });
    const result = data.sort((a: any, b: any) => {
      if (a.t < b.t) {
        return -1;
      } else if (a.t > b.t) {
        return 1;
      }
      return 0;
    });
    access.setDataList(0, result.map(r => r.point));
    access.setDataList(1, result.map(r => r.index));
  }
}
