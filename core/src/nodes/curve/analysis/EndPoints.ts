import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class EndPoints extends NodeBase {
  get displayName (): string {
    return 'End Points';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to evaluate', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('s', 'Curve start point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('e', 'Curve end point', DataTypes.POINT, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const domain = curve.domain();
    const start = curve.getPointAt(domain.start);
    const end = curve.getPointAt(domain.end);
    access.setData(0, start);
    access.setData(1, end);
  }
}
