
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NodeBase from '../../NodeBase';

export default class FilletAtParameter extends NodeBase {
  get displayName (): string {
    return 'CFlip';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to flip', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Flipped curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    access.setData(0, curve.flip());
  }
}
