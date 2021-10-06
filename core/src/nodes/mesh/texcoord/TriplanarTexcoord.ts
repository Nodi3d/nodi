
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFace } from '../../../math/geometry/mesh/NFace';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NodeBase } from '../../NodeBase';

export class TriplanarTexcoord extends NodeBase {
  get displayName (): string {
    return 'Triplanar Texcoord';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base mesh', DataTypes.MESH, AccessTypes.ITEM);
    manager.add('s', 'Texcoord scale', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Mesh with triplanar mapped texcoords', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0) as NMesh;
    const scale = access.getData(1) as number;

    const cloned = base.clone();
    const result = new NMesh();

    if (cloned.normals.length <= 0) {
      cloned.computeVertexNormals();
    }

    cloned.faces.forEach((face) => {
      const ia = face.a;
      const ib = face.b;
      const ic = face.c;
      const vertices = [cloned.vertices[ia], cloned.vertices[ib], cloned.vertices[ic]];
      const normals = [cloned.normals[ia], cloned.normals[ib], cloned.normals[ic]];
      const uv = vertices.map((p, i) => {
        return this.getTriplanarMap(p, normals[i], scale);
      });
      const index = result.vertices.length;
      result.vertices.push(vertices[0], vertices[1], vertices[2]);
      result.normals.push(normals[0], normals[1], normals[2]);
      result.uv.push(uv[0], uv[1], uv[2]);
      result.faces.push(new NFace(index, index + 1, index + 2));
    });

    access.setData(0, result);
  }

  private getTriplanarMap (position: Vector3, normal: Vector3, scale: number) {
    // Blending factor of triplanar mapping
    let bf = new Vector3(Math.abs(normal.x), Math.abs(normal.y), Math.abs(normal.z));
    const l = bf.dot(new Vector3(1, 1, 1));
    bf = bf.divideScalar(l);

    // Triplanar mapping
    const tx = (new Vector2(position.y, position.z)).multiplyScalar(scale);
    const ty = (new Vector2(position.z, position.x)).multiplyScalar(scale);
    const tz = (new Vector2(position.x, position.y)).multiplyScalar(scale);

    return tx.multiplyScalar(bf.x).add(ty.multiplyScalar(bf.y)).add(tz.multiplyScalar(bf.z));
  }
}
