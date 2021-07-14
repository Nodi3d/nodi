
import clipper from 'clipper-lib';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class OffsetCurve extends NodeBase {
  get displayName (): string {
    return 'COffset';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to offset', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('d', 'Offset distance', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('p', 'Plane for offset', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('t', 'Join type (0 = Square, 1 = Round, 2 = Miter)', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('r', 'Curve resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([64]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting curve', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const distance = access.getData(1) as number;
    const plane = access.getData(2) as NPlane;
    const joinType = access.getData(3) as number;
    const resolution = access.getData(4) as number;

    const precision = 1e5;

    let projected = [];
    if (curve instanceof NPolylineCurve) {
      projected = curve.points.map((p) => {
        return plane.project(p);
      });
      if (curve.closed) {
        projected.push(plane.project(curve.points[0]));
      }
    } else {
      projected = curve.getPoints(resolution).map((p) => {
        return plane.project(p);
      });
    }

    const path = projected.map((p) => {
      return new clipper.IntPoint(p.x * precision, p.y * precision);
    });

    const solution = new clipper.Paths();
    const co = new clipper.ClipperOffset();

    const endType = curve.closed ? clipper.EndType.etClosedPolygon : joinType;
    co.AddPaths([path], joinType, endType);
    co.Execute(solution, distance * precision);

    const paths: NPoint[][] = solution.map((path: any) => {
      const projected: NPoint[] = path.map((ip: any) => {
        const x = ip.X / precision;
        const y = ip.Y / precision;
        const dx = plane.xAxis.clone().multiplyScalar(x);
        const dy = plane.yAxis.clone().multiplyScalar(y);
        return dx.add(dy).add(plane.origin);
      });

      if (projected.length > 0) {
        const first = projected[0];
        const last = projected[projected.length - 1];
        const d = first.distanceTo(last);
        if (d < 1e-10) {
          projected.pop();
        }
      }
      return projected;
    });

    const result = paths.map((points) => {
      return new NPolylineCurve(points, true);
    });
    access.setDataList(0, result);
  }
}
