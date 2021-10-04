import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFace from '../../../math/geometry/mesh/NFace';
import NMesh from '../../../math/geometry/mesh/NMesh';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Mesh extends NodeBase {
  public get displayName (): string {
    return 'Mesh';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Vertices', DataTypes.POINT, AccessTypes.LIST);
    manager.add('f', 'Faces', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const vertices = access.getDataList(0) as NPoint[];
    const faces = access.getDataList(1) as NFace[];
    const mesh = new NMesh();
    mesh.vertices = vertices.slice();
    mesh.faces = faces.slice();
    mesh.computeVertexNormals();
    access.setData(0, mesh);
  }
}
