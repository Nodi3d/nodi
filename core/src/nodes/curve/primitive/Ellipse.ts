import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NEllipseCurve } from '../../../math/geometry/curve/NEllipseCurve';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class Ellipse extends NodeBase {
  get displayName (): string {
    return 'Ellipse';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base plane', DataTypes.PLANE | DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('rx', 'Radius in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('ry', 'Radius in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting ellipse', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0);
    const xr = access.getData(1);
    const yr = access.getData(2);

    let pl: NPlane;
    if (base instanceof NPoint) {
      pl = new NPlane(base.clone());
    } else {
      pl = base as NPlane;
    }

    const curve = new NEllipseCurve(pl, xr, yr);
    access.setData(0, curve);
  }
}
