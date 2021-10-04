
import { Box3, BoxGeometry, BufferAttribute, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFace from '../../../math/geometry/mesh/NFace';
import NMesh from '../../../math/geometry/mesh/NMesh';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class FaceTexcoord extends NodeBase {
  get displayName (): string {
    return 'Face Texcoord';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base mesh', DataTypes.MESH, AccessTypes.ITEM);
    manager.add('s', 'Texcoord scale', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Mesh with face plane texcoords', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0) as NMesh;
    const center = base.center();
    const scale = access.getData(1) as number;

    const result = new NMesh();
    base.faces.forEach((face) => {
      const v0 = base.vertices[face.a];
      const v1 = base.vertices[face.b];
      const v2 = base.vertices[face.c];
      const uv = [v0, v1, v2].map((p) => {
        return this.getTexcoord(p, base.computeFaceNormal(face), center, scale);
      });

      const index = result.vertices.length;
      result.vertices.push(v0, v1, v2);
      result.uv.push(uv[0], uv[1], uv[2]);
      if (base.normals.length > 0) {
        result.normals.push(base.normals[face.a], base.normals[face.b], base.normals[face.c]);
      }
      result.faces.push(new NFace(index, index + 1, index + 2));
    });

    access.setData(0, result);
  }

  // FaceNormalから算出されるXY軸を元にTexcoordを計算する
  // FaceNormalをPlaneのNormalとみなしたXY軸
  private getTexcoord (position: Vector3, normal: Vector3, center: Vector3, scale: number) {
    const plane = NPlane.fromOriginNormal(new NPoint(), normal);
    const proj = plane.project(position);
    const projCenter = plane.project(center);
    return proj.add(projCenter).multiplyScalar(scale);
  }
}
