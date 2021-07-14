import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NMesh from '../../../math/geometry/mesh/NMesh';
import MeshCSGNode from './MeshCSGNode';

export default class MeshIntersection extends MeshCSGNode {
  get displayName (): string {
    return 'Mesh Intersection';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('a', 'First mesh', DataTypes.MESH, AccessTypes.ITEM);
    manager.add('b', 'Second mesh set', DataTypes.MESH, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Mesh intersect result', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as NMesh;
    const b = access.getDataList(1) as NMesh[];

    let source = this.createSolid(a);
    for (let i = 0, n = b.length; i < n; i++) {
      const other = this.createSolid(b[i]);
      source = source.intersect(other);
    }

    const result = this.createMesh(source);
    access.setData(0, result);
  }
}
