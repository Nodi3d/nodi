
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { intersectsLineLine, intersectsLineMesh, SuccessCurveResultType } from '../../../math/geometry/NIntersection';
import { NodeBase } from '../../NodeBase';

export class LineMeshIntersection extends NodeBase {
  get displayName (): string {
    return 'Line | Mesh';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Line curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('m', 'Target mesh', DataTypes.MESH, AccessTypes.ITEM);
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

    const m = access.getData(1) as NMesh;

    const intersections = intersectsLineMesh(c, m.build());
    access.setDataList(0, intersections.map(i => i.point.position));
    access.setDataList(1, intersections.map(i => i.point.ta));
  }
}
