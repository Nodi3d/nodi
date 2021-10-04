import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NRectangleCurve } from '../../../math/geometry/curve/NRectangleCurve';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class Discontinuity extends NodeBase {
  get displayName (): string {
    return 'Discontinuity';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to analyze', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Points at discontinuities', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;

    if (
      curve instanceof NPolylineCurve ||
      curve instanceof NLineCurve
    ) {
      access.setDataList(0, curve.points);
    } else if (curve instanceof NRectangleCurve) {
      access.setDataList(0, curve.getCornerPoints());
    } else {
      access.setDataList(0, []);
    }
  }
}
