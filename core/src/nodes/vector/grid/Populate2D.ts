
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NRectangleCurve } from '../../../math/geometry/curve/NRectangleCurve';
import { NPoint } from '../../../math/geometry/NPoint';
import { PoissonDiskSampling } from '../../../math/misc/PoissonDiskSampling';
import { NodeBase } from '../../NodeBase';

export class Populate2D extends NodeBase {
  get displayName (): string {
    return 'Populate2D';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('r', 'Rectangle that defines the 2D region for point insertion', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('c', 'Count', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([20]));
    manager.add('s', 'Seed', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Population of inserted points', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const region = access.getData(0) as NCurve;
    const count = access.getData(1) as number;
    const seed = access.getData(2) as number;

    if (!(region instanceof NRectangleCurve)) {
      throw new TypeError('Input curve is not NRectangleCurve');
    }

    const plane = region.getPlane();
    const corners = region.getCornerPoints().map((p) => {
      const proj = plane.projectPoint(p);
      const x = plane.xAxis.dot(proj);
      const y = plane.yAxis.dot(proj);
      return new Vector2(x, y);
    });

    const points = PoissonDiskSampling.sample(corners, count, seed);
    const result = points.map((v) => {
      const v0 = plane.xAxis.clone().multiplyScalar(v.x);
      const v1 = plane.yAxis.clone().multiplyScalar(v.y);
      const nv = v0.addVectors(v0, v1);
      return NPoint.fromVector(nv);
    });

    access.setDataList(0, result);
  }
}
