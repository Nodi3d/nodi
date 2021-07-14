
import { Vector3 } from 'three';
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

export default class RectangularGrid extends NodeBase {
  get displayName (): string {
    return 'Rectangular';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Base plane for grid', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('sx', 'Size grid cells in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('sy', 'Size grid cells in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('ex', '# of grid cells in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
    manager.add('ey', '# of grid cells in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Grid cell outlines', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('p', 'Points at grid centers', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const sx = access.getData(1) as number;
    const sy = access.getData(2) as number;
    const ex = Math.floor(access.getData(3) as number);
    const ey = Math.floor(access.getData(4) as number);

    const curves: NCurve[][] = [];
    const points: NPoint[][] = [];

    const offset = plane.origin;
    const dx = plane.xAxis;
    const dy = plane.yAxis;

    // build points
    for (let ix = 0; ix <= ex; ix++) {
      const px = dx.clone().multiplyScalar(ix * sx).add(offset);
      const columns: NPoint[] = [];
      for (let iy = 0; iy <= ey; iy++) {
        const py = dy.clone().multiplyScalar(iy * sy).add(offset);
        const p = new NPoint(px.x + py.x, px.y + py.y, px.z + py.z);
        columns.push(p);
      }
      points.push(columns);
    }

    // build curves
    for (let ix = 0; ix < ex; ix++) {
      const column0 = points[ix];
      const column1 = points[ix + 1];
      const columns: NCurve[] = [];
      for (let iy = 0; iy < ey; iy++) {
        const curve = new NPolylineCurve([column0[iy], column1[iy], column1[iy + 1], column0[iy + 1]], true);
        columns.push(curve);
      }
      curves.push(columns);
    }

    access.setDataList(0, curves);
    access.setDataList(1, points);
  }
}
