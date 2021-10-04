
import { Delaunay } from 'd3-delaunay';
import { Vector3 } from 'three';

import { isClosedCurve } from '../curve/IClosedCurve';
import NCurve from '../curve/NCurve';
import NPolylineCurve from '../curve/NPolylineCurve';
import { TransformerType } from '../ITransformable';
import NFace from '../mesh/NFace';
import NMesh from '../mesh/NMesh';
import NPlane from '../NPlane';
import NPoint from '../NPoint';
import NSurface, { AdaptiveSurfaceTessellationOption } from './NSurface';

export default class NTrimmedSurface extends NSurface {
  private plane: NPlane;
  private curves: NCurve[];

  constructor (verb: any, plane: NPlane, curves: NCurve[] = []) {
    super(verb);
    this.plane = plane;
    this.curves = curves;
  }

  public clone (): NTrimmedSurface {
    const cloned = super.clone();
    const plane = this.plane.clone();
    const curves = this.curves.map(crv => crv.clone());
    return new NTrimmedSurface(cloned.getVerb(), plane, curves);
  }

  public transform (f: TransformerType) {
    const surface = super.transform(f);
    const plane = this.plane.transform(f);
    const curves = this.curves.map(crv => crv.transform(f));
    return new NTrimmedSurface(surface.getVerb(), plane, curves);
  }

  // TODO: corner cases
  // 境界のカーブが交差していたりするとマズそう
  public tessellate (option: AdaptiveSurfaceTessellationOption = {}, resolution: number = 32): NMesh {
    const { points } = this.tessellatePoints(resolution);

    const mesh = new NMesh();
    mesh.vertices = points;
    mesh.faces = this.collectFaces(points);
    mesh.computeVertexNormals();

    return mesh;
  }

  public extrudePoint (tip: NPoint, resolution: number): NMesh {
    const { points, edges } = this.tessellatePoints(resolution);

    const mesh = new NMesh();

    mesh.vertices = points;
    mesh.faces = this.collectFaces(points);

    // geom as a bottom surface
    // points in geom are corner points
    // TrimmedSurfaceのtessellateの結果に含まれる頂点は境界上の点なので、
    // 入力されたPointからgeomに含まれる頂点へ向かってEdgeを引いて面を貼ればよい
    mesh.vertices.push(tip);
    const idx = mesh.vertices.length - 1;
    edges.forEach((edge: number[]) => {
      const ia = edge[0];
      const ib = edge[1];
      mesh.faces.push(new NFace(idx, ia, ib));
    });
    // mesh.computeVertexNormals();
    // return mesh;
    return mesh.computeFlatNormalsMesh();
  }

  private tessellatePoints (resolution: number): { points: NPoint[], edges: number[][] } {
    let points: NPoint[] = [];
    const edges: number[][] = [];
    this.curves.forEach((curve) => {
      const prev = points.length;
      if (curve instanceof NPolylineCurve) {
        points = points.concat(curve.points);
      } else {
        const other = curve.getPoints(resolution);
        points = points.concat(other);
      }
      const to = points.length;
      const count = (to - prev) - 1;
      for (let i = 0; i < count; i++) {
        const idx = prev + i;
        edges.push([idx, idx + 1]);
      }
    });
    return { points, edges };
  }

  private collectFaces (points: Vector3[]): NFace[] {
    const pl = this.plane;
    const p2d = points.map((p) => {
      const projected = p.clone().projectOnPlane(pl.normal);
      return [
        pl.xAxis.dot(projected) - pl.xAxis.dot(pl.origin),
        pl.yAxis.dot(projected) - pl.yAxis.dot(pl.origin)
      ];
    });

    const delaunay = Delaunay.from(p2d);
    const triangles = delaunay.triangles;

    const faces = [];
    for (let i = 0, n = triangles.length; i < n; i += 3) {
      const i0 = triangles[i];
      const i1 = triangles[i + 1];
      const i2 = triangles[i + 2];

      const p0 = points[i0];
      const p1 = points[i1];
      const p2 = points[i2];
      const center = p0.clone().add(p1).add(p2).divideScalar(3);

      const found = this.curves.filter((crv) => {
        return isClosedCurve(crv) && crv.contains(center);
      });
      if (found.length % 2 === 1) {
        const face = new NFace(i0, i1, i2);
        faces.push(face);
      }
    }

    return faces;
  }

  public toString (): string {
    return 'NTrimmedSurface';
  }
}
