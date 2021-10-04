
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import { intersectsLineLine, SuccessCurveResultType } from '../../../math/geometry/NIntersection';
import NodeBase from '../../NodeBase';

export default class LineIntersection extends NodeBase {
  get displayName (): string {
    return 'Line | Line';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('a', 'First line curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('b', 'Second line curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Intersection points', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('a', 'Parameter on first line curve', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('b', 'Parameter on second line curve', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as NCurve;
    const b = access.getData(1) as NCurve;

    const result = intersectsLineLine(a, b);
    if (result.result) {
      const { point } = result as SuccessCurveResultType;
      access.setData(0, point.position);
      access.setData(1, point.ta);
      access.setData(2, point.tb);
    }
  }
}
