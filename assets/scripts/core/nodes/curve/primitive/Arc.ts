
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NArcCurve from '../../../math/geometry/curve/NArcCurve';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Arc extends NodeBase {
  get displayName (): string {
    return 'Arc';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base plane', DataTypes.PLANE | DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('a', 'Angle in radians', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([Math.PI]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting arc', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0);
    const radius = access.getData(1);
    const angle = access.getData(2);

    let pl: NPlane;
    if (base instanceof NPoint) {
      pl = new NPlane(base.clone());
    } else {
      pl = base as NPlane;
    }

    const curve = new NArcCurve(pl, 0, angle, radius);
    access.setData(0, curve);
  }
}
