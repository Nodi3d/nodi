
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFace from '../../../math/geometry/mesh/NFace';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class TrianglePoint extends NodeBase {
  get displayName (): string {
    return 'Triangle Point';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Triangular face', DataTypes.FACE, AccessTypes.ITEM);
    manager.add('p', 'Vertices', DataTypes.POINT, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Triangular points', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const face = access.getData(0) as NFace;
    const vertices = access.getDataList(1) as NPoint[];

    const pa = vertices[face.a];
    const pb = vertices[face.b];
    const pc = vertices[face.c];
    access.setDataList(0, [pa, pb, pc]);
  }
}
