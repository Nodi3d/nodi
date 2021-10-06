
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCircleCurve } from '../../../math/geometry/curve/NCircleCurve';
import { NodeBase } from '../../NodeBase';

export class Circle3Pt extends NodeBase {
  get displayName (): string {
    return 'Circle 3Pt';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'First point on circle', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('s', 'Second point on circle', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('t', 'Third point on circle', DataTypes.POINT, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting circle', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Circle plane', DataTypes.PLANE, AccessTypes.ITEM);
    manager.add('r', 'Circle radius', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const p0 = access.getData(0);
    const p1 = access.getData(1);
    const p2 = access.getData(2);

    const curve = NCircleCurve.from3Points(p0, p1, p2);
    access.setData(0, curve);
    access.setData(1, curve.getPlane());
    access.setData(2, curve.getRadius());
  }
}
