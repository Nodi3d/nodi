
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NFace } from '../../../math/geometry/mesh/NFace';
import { intersectsLineTriangles } from '../../../math/geometry/NIntersection';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class LineTriangleIntersection extends NodeBase {
  get displayName (): string {
    return 'Line | Triangle';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Line curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('v', 'Target vertices', DataTypes.POINT, AccessTypes.LIST);
    manager.add('f', 'Target triangles', DataTypes.FACE, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Intersection point', DataTypes.POINT, AccessTypes.LIST);
    manager.add('t', 'Parameter on line curve', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const c = access.getData(0) as NCurve;
    if (!(c instanceof NLineCurve)) {
      throw new TypeError('Input curve must be line curve');
    }
    const vertices = access.getDataList(1) as NPoint[];
    const faces = access.getDataList(2) as NFace[];

    const intersections = intersectsLineTriangles(c, vertices, faces);
    access.setDataList(0, intersections.map(i => i.point.position));
    access.setDataList(1, intersections.map(i => i.point.ta));
  }
}
