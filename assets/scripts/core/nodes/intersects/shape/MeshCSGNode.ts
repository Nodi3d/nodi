import { CSG } from '@jscad/csg';
import NodeBase from '../../NodeBase';
import NMesh from '../../../math/geometry/mesh/NMesh';
import NFace from '../../../math/geometry/mesh/NFace';
import NPoint from '../../../math/geometry/NPoint';

export default abstract class MeshCSGNode extends NodeBase {
  protected createMesh (solid: any): NMesh {
    const mesh = new NMesh();
    let offset = 0;

    // https://gist.github.com/knee-cola/0a53b4e860b3c00ed6c9027c2206452c
    solid.polygons.forEach((polygon: any) => {
      const len = polygon.vertices.length;
      polygon.vertices.forEach((v: any) => {
        const p = v.pos;
        mesh.vertices.push(new NPoint(p.x, p.y, p.z));
      });
      for (let i = 2; i < len; i++) {
        mesh.faces.push(new NFace(offset, offset + i - 1, offset + i));
      }
      offset += len;
    });

    mesh.mergeVertices();

    return mesh.computeFlatNormalsMesh();
  }

  protected createSolid (mesh: NMesh): any {
    const points: any[] = mesh.vertices.map((v) => {
      return new CSG.Vector3D(v.x, v.y, v.z);
    });
    const polygons = mesh.faces.map((f) => {
      return new CSG.Polygon([
        new CSG.Vertex(points[f.a]),
        new CSG.Vertex(points[f.b]),
        new CSG.Vertex(points[f.c])
      ]);
    });
    return CSG.fromPolygons(polygons);
  }
}
