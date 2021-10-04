
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class SquareGrid extends NodeBase {
  get displayName (): string {
    return 'SquareGrid';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Base plane for grid', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('s', 'Size of grid cells', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('x', '# of grid cells in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([5]));
    manager.add('y', '# of grid cells in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([5]));
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

    const offset = plane.origin;
    const dx = plane.xAxis;
    const dy = plane.yAxis;

    const curves: NPolylineCurve[][] = [];
    for (let ix = 0; ix < ex; ix++) {
      const px0 = dx.clone().multiplyScalar(ix * size).add(offset);
      const px1 = dx.clone().multiplyScalar((ix + 1) * size).add(offset);

      const columns: NPolylineCurve[] = [];
      for (let iy = 0; iy < ey; iy++) {
        const py0 = dy.clone().multiplyScalar(iy * size).add(offset);
        const py1 = dy.clone().multiplyScalar((iy + 1) * size).add(offset);

        const p0 = (new NPoint()).addVectors(px0, py0);
        const p1 = (new NPoint()).addVectors(px1, py0);
        const p2 = (new NPoint()).addVectors(px1, py1);
        const p3 = (new NPoint()).addVectors(px0, py1);
        const curve = new NPolylineCurve([p0, p1, p2, p3], true);
        columns.push(curve);
      }
      curves.push(columns);
    }

    const points: NPoint[][] = [];
    for (let ix = 0; ix <= ex; ix++) {
      const px = dx.clone().multiplyScalar(ix * size).add(offset);
      const columns: NPoint[] = [];
      for (let iy = 0; iy <= ey; iy++) {
        const py = dy.clone().multiplyScalar(iy * size).add(offset);
        const v = (new Vector3()).addVectors(px, py);
        columns.push(NPoint.fromVector(v));
      }
      points.push(columns);
    }

    access.setDataList(0, curves);
    access.setDataList(1, points);
  }
}
