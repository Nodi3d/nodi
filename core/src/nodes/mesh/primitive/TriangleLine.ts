
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NFace } from '../../../math/geometry/mesh/NFace';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class TriangleLine extends NodeBase {
  get displayName (): string {
    return 'Triangle Line';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Triangular face', DataTypes.FACE, AccessTypes.ITEM);
    manager.add('p', 'Vertices', DataTypes.POINT, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Triangular line', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const face = access.getData(0) as NFace;
    const vertices = access.getDataList(1) as NPoint[];

    const pa = vertices[face.a];
    const pb = vertices[face.b];
    const pc = vertices[face.c];
    const curve = new NPolylineCurve([pa, pb, pc], true);
    access.setData(0, curve);
  }
}
