
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

export class PolyCircle extends NodeBase {
  get displayName (): string {
    return 'PolyCircle';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base plane', DataTypes.PLANE | DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('s', 'Segments', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([8]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting poly circle', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0) as (NPoint | NPlane);
    const radius = access.getData(1) as number;
    const segments = Math.floor(access.getData(2)) as number;

    let pl: NPlane;
    if (base instanceof NPoint) {
      pl = new NPlane(base.clone());
    } else {
      pl = base as NPlane;
    }

    const points: NPoint[] = [];

    const pi2 = Math.PI * 2;
    for (let i = 0; i < segments; i++) {
      const r = i / segments * pi2;
      const c = Math.cos(r) * radius;
      const s = Math.sin(r) * radius;
      // const p = new NPoint().add(pl.xAxis.clone().multiplyScalar(c)).add(pl.yAxis.clone().multiplyScalar(s));
      const p = pl.origin.clone().add(pl.xAxis.clone().multiplyScalar(c)).add(pl.yAxis.clone().multiplyScalar(s));
      points.push(p);
    }

    const curve = new NPolylineCurve(points, true);
    access.setData(0, curve);
  }
}
