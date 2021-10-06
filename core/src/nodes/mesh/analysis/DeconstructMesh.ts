
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { MeshTopology } from '../../../math/geometry/mesh/MeshTopology';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NodeBase } from '../../NodeBase';

export class DeconstructMesh extends NodeBase {
  get displayName (): string {
    return 'DeMesh';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Base mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Faces of base mesh', DataTypes.FACE, AccessTypes.LIST);
    manager.add('c', 'Edges of base mesh (line curves)', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('p', 'Vertices of base mesh', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const mesh = access.getData(0) as NMesh;
    const vertices = mesh.vertices;
    const faces = mesh.faces;

    const edges: NCurve[] = [];
    const topo = new MeshTopology(mesh);
    topo.edges.forEach((e) => {
      edges.push(new NLineCurve(vertices[e.index0], vertices[e.index1]));
    });

    access.setDataList(0, faces);
    access.setDataList(1, edges);
    access.setDataList(2, vertices);
  }
}
