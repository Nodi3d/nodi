import { union } from '@jscad/modeling/src/operations/booleans';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { MeshCSGNode } from './MeshCSGNode';

export class MeshUnion extends MeshCSGNode {
  get displayName (): string {
    return 'Mesh Union';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Meshes to union', DataTypes.MESH, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Mesh union result', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const meshes = access.getDataList(0) as NMesh[];

    let source = this.createSolid(meshes[0]);
    for (let i = 1, n = meshes.length; i < n; i++) {
      const other = this.createSolid(meshes[i]);
      source = union([source, other]);
    }

    const result = this.createMesh(source);
    access.setData(0, result);
  }
}
