import { geometries, maths } from '@jscad/modeling';
import { NodeBase } from '../../NodeBase';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NFace } from '../../../math/geometry/mesh/NFace';
import { NPoint } from '../../../math/geometry/NPoint';

// https://github.com/jscad/OpenJSCAD.org/tree/V2/packages/modeling/src
export abstract class MeshCSGNode extends NodeBase {
  protected createMesh (solid: geometries.geom3.Geom3): NMesh {
    const mesh = new NMesh();
    let offset = 0;

    // https://gist.github.com/knee-cola/0a53b4e860b3c00ed6c9027c2206452c
    solid.polygons.forEach((polygon: geometries.poly3.Poly3) => {
      const len = polygon.vertices.length;
      polygon.vertices.forEach((v) => {
        mesh.vertices.push(new NPoint().fromArray(v));
      });
      for (let i = 2; i < len; i++) {
        mesh.faces.push(new NFace(offset, offset + i - 1, offset + i));
      }
      offset += len;
    });

    mesh.mergeVertices();

    return mesh.computeFlatNormalsMesh();
  }

  protected createSolid (mesh: NMesh): geometries.geom3.Geom3 {
    const points: maths.vec3.Vec3[] = mesh.vertices.map((v) => {
      return maths.vec3.fromValues(v.x, v.y, v.z);
    });
    const polygons = mesh.faces.map((f) => {
      return geometries.poly3.fromPoints([
        points[f.a],
        points[f.b],
        points[f.c]
      ]);
    });
    return geometries.geom3.create(polygons);
  }
}
