
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import { intersectsCurveCurve } from '../../../math/geometry/NIntersection';
import NodeBase from '../../NodeBase';

export default class CurveIntersection extends NodeBase {
  get displayName (): string {
    return 'Curve | Curve';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('a', 'First curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('b', 'Second curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Intersection points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('a', 'Parameter on first line curve', DataTypes.NUMBER, AccessTypes.LIST);
    manager.add('b', 'Parameter on second line curve', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as NCurve;
    const b = access.getData(1) as NCurve;

    const intersections = intersectsCurveCurve(a, b);
    access.setDataList(0, intersections.map(i => i.position));
    access.setDataList(1, intersections.map(i => i.ta));
    access.setDataList(2, intersections.map(i => i.tb));
  }
}
