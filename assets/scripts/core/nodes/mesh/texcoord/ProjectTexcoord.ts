
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFace from '../../../math/geometry/mesh/NFace';
import NMesh from '../../../math/geometry/mesh/NMesh';
import NPlane from '../../../math/geometry/NPlane';
import NodeBase from '../../NodeBase';

export default class ProjectTexcoord extends NodeBase {
  get displayName (): string {
    return 'Proj Texcoord';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base mesh', DataTypes.MESH, AccessTypes.ITEM);
    manager.add('p', 'Plane for projection', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('s', 'Texcoord scale', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Mesh with projected texcoords', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0) as NMesh;
    const plane = access.getData(1) as NPlane;
    const scale = access.getData(2) as number;

    const result = new NMesh();

    const hasNormals = base.normals.length > 0;
    base.faces.forEach((f) => {
      const ia = f.a;
      const ib = f.b;
      const ic = f.c;
      const vertices = [base.vertices[ia], base.vertices[ib], base.vertices[ic]];
      const uv = vertices.map((p) => {
        return this.getProjectedMap(p, plane, scale);
      });
      const index = result.vertices.length;
      result.vertices.push(vertices[0], vertices[1], vertices[2]);
      result.uv.push(uv[0], uv[1], uv[2]);
      if (hasNormals) {
        result.normals.push(base.normals[ia], base.normals[ib], base.normals[ic]);
      }
      result.faces.push(new NFace(index, index + 1, index + 2));
    });

    access.setData(0, result);
  }

  private getProjectedMap (position: Vector3, plane: NPlane, scale: number) {
    return plane.project(position).multiplyScalar(scale);
  }
}
