import { BufferGeometry, BufferAttribute, Matrix4, Vector2, Vector3, Vector4 } from 'three';
import verb from '../../../lib/verb/verb';
import NMesh from '../mesh/NMesh';
import NPoint from '../NPoint';
import ITransformable, { TransformerType } from '../ITransformable';
import NFace from '../mesh/NFace';

export type AdaptiveSurfaceTessellationOption = {
  minDivsV?: number;
  minDivsU?: number;

  // min & max depth mean # of divide in a patch
  maxDepth?: number;
  minDepth?: number;

  // threshold to divide
  normTol?: number;

  // if refine flag is false, division is not executed
  refine?: boolean;
};

export default class NSurface implements ITransformable {
  protected verb: any;

  constructor (verb: any) {
    this.verb = verb;
  }

  public static byKnotsControlPointsWeights (udegree: number, vdegree: number, uknots: number[], vknots: number[], points: Vector3[][]): NSurface {
    const nurbs = verb.geom.NurbsSurface.byKnotsControlPointsWeights(udegree, vdegree, uknots, vknots, points.map(cols => cols.map(v => v.toArray())));
    return new NSurface(nurbs);
  }

  public getVerb (): any {
    return this.verb;
  }

  controlPoints (): Vector4[][] {
    const arr = this.verb.controlPoints();
    return arr.map((cols: number[][]) => {
      return cols.map((ret: number[]) => {
        return new Vector4(ret[0], ret[1], ret[2], ret[3]);
      });
    });
  }

  point (x: number, y: number): NPoint {
    const ret = this.verb.point(x, y) as number[];
    return new NPoint(ret[0], ret[1], ret[2]);
  }

  center (): NPoint {
    return this.point(0.5, 0.5);
  }

  area (): number {
    const mesh = this.tessellate({});
    const area = mesh.area();
    mesh.dispose();
    return area;
  }

  normal (x: number, y: number): Vector3 {
    const ret = this.verb.normal(x, y) as number[];
    return new Vector3(ret[0], ret[1], ret[2]);
  }

  closestPoint (p: Vector3): NPoint {
    const ret = this.verb.closestPoint(p.toArray()) as number[];
    return new NPoint(ret[0], ret[1], ret[2]);
  }

  closestParam (p: Vector3): Vector2 {
    const ret = this.verb.closestParam(p.toArray()) as number[];
    return new Vector2(ret[0], ret[1]);
  }

  derivatives (u: number, v: number, w: number): Vector3[][] {
    return this.verb.derivatives(u, v, w).map((arr: number[][]) => {
      return arr.map((ret: number[]) => {
        return new Vector3(ret[0], ret[1], ret[2]);
      });
    });
  }

  tessellate (option: AdaptiveSurfaceTessellationOption = {}): NMesh {
    const tess = this.verb.tessellate(option);

    const mesh = new NMesh();
    tess.points.forEach((p: number[]) => {
      mesh.vertices.push(new NPoint(p[0], p[1], p[2]));
    });
    tess.normals.forEach((vn: number[]) => {
      mesh.normals.push(new Vector3(vn[0], vn[1], vn[2]));
    });
    tess.faces.forEach((face: number[]) => {
      mesh.faces.push(new NFace(face[0], face[1], face[2]));
    });
    return mesh;
  }

  public extrudePoint (tip: Vector3, _resolution: number): NMesh {
    const p0 = this.point(0, 0);
    const p1 = this.point(1, 0);
    const p2 = this.point(1, 1);
    const p3 = this.point(0, 1);
    const c = p0.clone().add(p1).add(p2).add(p3).divideScalar(4).add(tip);

    const mesh = new NMesh();

    mesh.vertices.push(p0, p1, p2, p3, c);
    const uv0 = new Vector2(0, 0);
    const uv1 = new Vector2(1, 0);
    const uv2 = new Vector2(1, 1);
    const uv3 = new Vector2(0, 1);
    const uvc = new Vector2(0.5, 0.5);
    mesh.uv.push(
      uv0, uv1, uv2, uv3, uvc
    );
    mesh.faces.push(
      new NFace(0, 1, 4),
      new NFace(1, 2, 4),
      new NFace(2, 3, 4),
      new NFace(3, 0, 4)
    );
    // mesh.computeVertexNormals();
    // return mesh;
    return mesh.computeFlatNormalsMesh();
  }

  clone (): NSurface {
    return new NSurface(this.verb.clone());
  }

  public toString (): string {
    return 'NSurface';
  }

  public applyMatrix (m: Matrix4): NSurface {
    const surface = this.clone();
    const arr = surface.controlPoints();
    const points = arr.map((cols: Vector4[]) => {
      return cols.map((p: Vector4) => {
        const transformed = p.clone().applyMatrix4(m);
        return [
          transformed.x, transformed.y, transformed.z, transformed.w
        ];
      });
    });
    surface.verb._data.controlPoints = points;
    return surface;
  }

  public transform (f: TransformerType): NSurface {
    let verb = this.verb;

    const arr = this.controlPoints();
    const points = arr.map((cols) => {
      return cols.map((p: Vector4) => {
        const v3 = f(new NPoint(p.x, p.y, p.z));
        return [v3.x, v3.y, v3.z, p.w];
      });
    });

    verb = verb.clone();
    verb._data.controlPoints = points;
    return new NSurface(verb);
  }
}
