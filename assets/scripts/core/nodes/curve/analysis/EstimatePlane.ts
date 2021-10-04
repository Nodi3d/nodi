import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class EstimatePlane extends NodeBase {
  get displayName (): string {
    return 'Estimate Plane';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to estimate', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Estimated plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    access.setData(0, curve.getCurvePlane());
  }
}
