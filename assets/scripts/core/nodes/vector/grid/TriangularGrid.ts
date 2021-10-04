
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class TriangularGrid extends NodeBase {
  get displayName (): string {
    return 'Triangular';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Base plane for grid', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('s', 'Size of grid cells', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('x', '# of grid cells in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
    manager.add('y', '# of grid cells in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Grid cell outlines', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('p', 'Points at grid centers', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const size = access.getData(1) as number;
    const ex = access.getData(2) as number;
    const ey = access.getData(3) as number;

    const curves = this.grid(plane, size, ex, ey, (p0, p1, p2) => new NPolylineCurve([p0, p1, p2], true));
    const points = this.grid(plane, size, ex, ey, (p0, p1, p2) => {
      return p0.clone().add(p1).add(p2).divideScalar(3.0);
    });

    access.setDataList(0, curves);
    access.setDataList(1, points);
  }

  private grid (plane: NPlane, size: number, ex: number, ey: number, fn: (a: NPoint, b: NPoint, c: NPoint) => (NPoint | NPolylineCurve)) {
    const dx = plane.xAxis.clone().normalize();
    const dy = plane.yAxis.clone().normalize();

    const sin60 = Math.sqrt(3) / 2.0;
    const h = size * sin60;

    const result: (NPoint | NPolylineCurve)[] = [];

    for (let iy = 0; iy < ey; iy++) {
      const by = (iy % 2 === 0);
      const yt = dy.clone().multiplyScalar((iy + 1) * h);
      const yb = dy.clone().multiplyScalar(iy * h);

      for (let ix = 0; ix < ex; ix++) {
        const bx = (ix % 2 === 0);
        const gx = ix / 2;

        const triangle = () => {
          const xc = dx.clone().multiplyScalar((gx + 0.5) * size);
          const xl = dx.clone().multiplyScalar(gx * size);
          const xr = dx.clone().multiplyScalar((gx + 1) * size);
          const p0 = (new NPoint()).addVectors(xl, yt);
          const p1 = (new NPoint()).addVectors(xr, yt);
          const p2 = (new NPoint()).addVectors(xc, yb);
          return fn(p0, p1, p2);
        };

        const invTriangle = () => {
          const xc = dx.clone().multiplyScalar((gx + 0.5) * size);
          const xl = dx.clone().multiplyScalar(gx * size);
          const xr = dx.clone().multiplyScalar((gx + 1.0) * size);
          const p0 = (new NPoint()).addVectors(xc, yt);
          const p1 = (new NPoint()).addVectors(xr, yb);
          const p2 = (new NPoint()).addVectors(xl, yb);
          return fn(p0, p1, p2);
        };

        let u: (NPoint | NPolylineCurve);
        if (by) {
          if (bx) { u = invTriangle(); } else { u = triangle(); }
        } else if (!bx) { u = invTriangle(); } else { u = triangle(); }

        result.push(u);
      }
    }

    return result;
  }
}
