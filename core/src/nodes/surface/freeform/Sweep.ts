
import verb from '../../../lib/verb/verb';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';
import { NSurface } from '../../../math/geometry/surface/NSurface';
import { NCurve } from '../../../math/geometry/curve/NCurve';

export class Sweep extends NodeBase {
  get displayName (): string {
    return 'Sweep';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('r', 'Rail curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('s', 'Section curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Resulting sweep surface', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const rail = (access.getData(0) as NCurve).toNurbsCurve();
    const profile = (access.getData(1) as NCurve).toNurbsCurve();

    const data = new verb.geom.SweptSurface(profile.verb, rail.verb);
    access.setData(0, new NSurface(data));
  }
}
