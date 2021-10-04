
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class HexagonalGrid extends NodeBase {
  get displayName (): string {
    return 'HexGrid';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Base plane for grid', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Size of hexagon radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('x', '# of grid cells in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
    manager.add('y', '# of grid cells in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Grid cell outlines', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('p', 'Points at grid centers', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const root3 = Math.sqrt(3);
    const alpha = 2 / root3;
    const beta = 3 / root3;

    const plane = access.getData(0) as NPlane;
    const radius = access.getData(1) as number;
    const ex = access.getData(2) as number;
    const ey = access.getData(3) as number;

    const grid: { center: NPoint; curve: NCurve; }[][] = [];

    const offset = plane.origin;
    const dx = plane.xAxis;
    const dy = plane.yAxis;
    const r2 = radius * 2;
    const size = 2 * radius * alpha;
    const sx = radius * beta;

    const sincos = [0, 1, 2, 3, 4, 5].map((i) => {
      const r = i / 6 * Math.PI * 2;
      return {
        cos: Math.cos(r) * alpha * radius,
        sin: Math.sin(r) * alpha * radius
      };
    });

    for (let ix = 0; ix < ex; ix++) {
      const cx = dx.clone().multiplyScalar(ix * sx + size * 0.5).add(offset);
      const yoff = radius + (ix % 2 === 1 ? radius : 0);

      const columns = [];
      for (let iy = 0; iy < ey; iy++) {
        const cy = dy.clone().multiplyScalar(iy * r2 + yoff).add(offset);
        const center = NPoint.fromVector(cx.clone().add(cy));
        const points = sincos.map((sc) => {
          const d = dx.clone().multiplyScalar(sc.cos).add(dy.clone().multiplyScalar(sc.sin));
          return center.clone().add(d);
        });
        const curve = new NPolylineCurve(points, true);
        columns.push({
          center,
          curve
        });
      }

      grid.push(columns);
    }

    access.setDataList(0, grid.map(column => column.map(g => g.curve)));
    access.setDataList(1, grid.map(column => column.map(g => g.center)));
  }
}
