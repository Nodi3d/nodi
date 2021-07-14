import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPlane from '../../../math/geometry/NPlane';
import NodeBase from '../../NodeBase';

export default class PerpFrames extends NodeBase {
  get displayName (): string {
    return 'PFrames';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to evaluate', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('n', 'Number of segments', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Curve frames', DataTypes.PLANE, AccessTypes.LIST);
    manager.add('p', 'Parameter values at frame points', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const count = access.getData(1) as number;

    const frames = [];
    const icount = Math.floor(count);

    const length = curve.length();
    const step = 1 / icount;
    for (let i = 0; i < icount; i++) {
      const u = i * step;
      const origin = curve.getPointAt(u);
      const tangent = curve.getTangentAt(u);
      const plane = NPlane.fromOriginNormal(origin, tangent);
      frames.push({
        plane,
        parameter: length * u
      });
    }

    if (!curve.closed) {
      const origin = curve.getPointAt(1);
      const tangent = curve.getTangentAt(1);
      const plane = NPlane.fromOriginNormal(origin, tangent);
      frames.push({
        plane,
        parameter: length
      });
    }

    access.setDataList(0, frames.map(f => f.plane));
    access.setDataList(1, frames.map(f => f.parameter));
  }
}
