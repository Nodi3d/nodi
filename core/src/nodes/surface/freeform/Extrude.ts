
import { Vector3 } from 'three';
import verb from '../../../lib/verb/verb';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';
import { NSurface } from '../../../math/geometry/surface/NSurface';
import { NTrimmedSurface } from '../../../math/geometry/surface/NTrimmedSurface';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { findMeshBoundary } from '../../../math/geometry/mesh/MeshHelper';
import { DataTree } from '../../../data/DataTree';
import { NFace } from '../../../math/geometry/mesh/NFace';

export class Extrude extends NodeBase {
  get displayName (): string {
    return 'Extrude';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Profile curve or surface', DataTypes.CURVE | DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('d', 'Extrusion direction', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('r', 'Extrusion resolution', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([16]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Extrusion result', DataTypes.SURFACE | DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const profile = access.getData(0) as (NCurve | NSurface);
    const direction = access.getData(1) as Vector3;

    if (profile instanceof NCurve) {
      const nurbs = profile.toNurbsCurve();
      const data = new verb.geom.ExtrudedSurface(nurbs.verb, direction.toArray());
      access.setData(0, new NSurface(data));
    } else {
      const mesh = this.buildSurfaceMesh(profile, direction);
      access.setData(0, mesh);
    }
  }

  private buildSurfaceMesh (surface: (NSurface | NTrimmedSurface), vector: Vector3): NMesh {
    const source = surface.tessellate({});
    const dest = source.clone();

    // 面がvector方向について表か裏かを判断する
    // 表の場合( dot(face.normal, vector) >= 0 )、面を反転させないとMesh全体で面の方向が一様でなくなってしまう
    if (source.faces.length > 0) {
      const face = source.faces[0];
      const v0 = source.vertices[face.a];
      const v1 = source.vertices[face.b];
      const v2 = source.vertices[face.c];
      const v10 = (new Vector3()).subVectors(v1, v0);
      const v21 = (new Vector3()).subVectors(v2, v1);
      const normal = (new Vector3()).crossVectors(v10, v21).normalize();
      const dot = normal.dot(vector);
      if (dot > 0) {
        // invert faces
        const flips = source.faces.map((f) => {
          return f.flip();
        });
        source.faces = flips.slice();
        dest.faces = flips;
      }
    }

    const vlen = source.vertices.length;
    for (let i = 0; i < vlen; i++) {
      const p = source.vertices[i].clone();
      const extr = p.add(vector);
      dest.vertices.push(extr);
    }

    // top faces
    for (let i = 0, n = source.faces.length; i < n; i++) {
      const face = source.faces[i];
      const a = face.a + vlen;
      const b = face.b + vlen;
      const c = face.c + vlen;
      dest.faces.push(new NFace(c, b, a));
    }

    const edges = findMeshBoundary(source);
    edges.forEach((e) => {
      const i0 = e.a;
      const i1 = e.b;
      const i2 = e.a + vlen;
      const i3 = e.b + vlen;
      dest.faces.push(new NFace(i2, i1, i0));
      dest.faces.push(new NFace(i1, i2, i3));
    });

    // dest.computeVertexNormals();
    // return dest;
    return dest.computeFlatNormalsMesh();
  }
}
