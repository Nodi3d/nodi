
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import { NRectangleCurve } from '../../../math/geometry/curve';
import NCurve from '../../../math/geometry/curve/NCurve';
import NLineCurve from '../../../math/geometry/curve/NLineCurve';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Explode extends NodeBase {
  get displayName (): string {
    return 'Explode';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to explode', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Exploded segments (line curve) that make up the base curve', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('v', 'Vertices of the exploded segments (line curve)', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;

    if (curve instanceof NPolylineCurve || curve instanceof NRectangleCurve) {
      const points = curve.points;
      const len = points.length;
      const segments = [];
      const n = (curve.closed) ? len : len - 1;
      for (let i = 0; i < n; i++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % len];
        segments.push(new NLineCurve(p0, p1));
      }
      access.setDataList(0, segments);
      access.setDataList(1, points);
    } else {
      access.setDataList(0, [curve]);
      access.setDataList(1, [curve.getPointAt(0), curve.getPointAt(1)]);
    }
  }
}
