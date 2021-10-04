import { Vector3 } from 'three';
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

export default class ArcSED extends NodeBase {
  get displayName (): string {
    return 'Arc SED';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Start point of arc', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('e', 'End point of arc', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint(1, 0, 0)]));
    manager.add('t', 'Direction (tangent) at start', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(0, 0, 1)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting arc', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Arc plane', DataTypes.PLANE, AccessTypes.ITEM);
    manager.add('r', 'Arc radius', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const start = access.getData(0);
    const end = access.getData(1);
    const direction = access.getData(2);

    let m = (new NPoint()).addVectors(start, end);
    m = m.multiplyScalar(0.5);

    const t = (new Vector3()).subVectors(end, start);
    const pl = new NPlane(m, t.clone().normalize(), direction.normalize());
    const curve = new NArcCurve(pl, 0, Math.PI, t.length() * 0.5);

    access.setData(0, curve);
    access.setData(1, curve.getPlane());
    access.setData(2, curve.getRadius());
  }
}
