
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NodeBase } from '../../NodeBase';

export class JoinMeshes extends NodeBase {
  get displayName (): string {
    return 'MJoin';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Meshes to join', DataTypes.MESH, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Joined mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const meshes = access.getDataList(0) as NMesh[];
    const geometries = meshes.map(m => m.build());
    const merged = mergeBufferGeometries(geometries);
    access.setData(0, NMesh.fromBufferGeometry(merged));
  }
}
