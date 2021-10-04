import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCircleCurve from '../../../math/geometry/curve/NCircleCurve';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Circle extends NodeBase {
  get displayName (): string {
    return 'Circle';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base plane', DataTypes.PLANE | DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting circle', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Circle plane', DataTypes.PLANE, AccessTypes.ITEM);
    manager.add('r', 'Circle radius', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0);
    const radius = access.getData(1);

    let pl: NPlane;
    if (base instanceof NPoint) {
      pl = new NPlane(base.clone());
    } else {
      pl = base as NPlane;
    }

    const circle = new NCircleCurve(pl, radius);
    access.setData(0, circle);
    access.setData(1, circle.getPlane());
    access.setData(2, circle.getRadius());
  }
}
