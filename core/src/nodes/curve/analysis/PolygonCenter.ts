import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NodeBase } from '../../NodeBase';

export class PolygonCenter extends NodeBase {
  get displayName (): string {
    return 'Polygon Center';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Polyline to average', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Average of polyline vertices', DataTypes.POINT, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    if (curve instanceof NPolylineCurve) {
      access.setData(0, curve.center());
    } else {
      throw new TypeError('Input curve is not polyline curve.');
    }
  }
}
