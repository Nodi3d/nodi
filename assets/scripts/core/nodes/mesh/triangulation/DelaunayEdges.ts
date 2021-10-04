
import { Delaunay } from 'd3-delaunay';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NLineCurve from '../../../math/geometry/curve/NLineCurve';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

class Edge {
  a: number;
  b: number;
  pa: NPoint;
  pb: NPoint;

  constructor (a: number, b: number, pa: NPoint, pb: NPoint) {
    this.a = a;
    this.b = b;
    this.pa = pa;
    this.pb = pb;
  }

  public contains (i0: number, i1: number): boolean {
    return (i0 === this.a && i1 === this.b) || (i0 === this.b && i1 === this.a);
  }
}

export default class DelaunayEdges extends NodeBase {
  get displayName (): string {
    return 'Delaunay Edges';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Points for triangulate', DataTypes.POINT, AccessTypes.LIST);
    manager.add('p', 'Optional base plane', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Edges of the connectivity diagram (line curve)', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const points = access.getDataList(0) as NPoint[];
    const pl = access.getData(1) as NPlane;

    const edges: Edge[] = [];
    const p2d = points.map((p) => {
      const v = pl.project(p);
      return [v.x, v.y];
    });
    if (p2d.length > 0) {
      const delaunay = Delaunay.from(p2d);
      const triangles = delaunay.triangles;

      for (let i = 0, n = triangles.length; i < n; i += 3) {
        const i0 = triangles[i];
        const i1 = triangles[i + 1];
        const i2 = triangles[i + 2];

        this.addEdge(i0, i1, edges, points);
        this.addEdge(i1, i2, edges, points);
        this.addEdge(i2, i0, edges, points);
      }
    }
    const curves = edges.map((e) => {
      return new NLineCurve(e.pa, e.pb);
    });
    access.setDataList(0, curves);
  }

  private addEdge (i0: number, i1: number, edges: Edge[], points: NPoint[]): void {
    const found = edges.find((e) => {
      return e.contains(i0, i1);
    });
    if (found === undefined) {
      edges.push(new Edge(i0, i1, points[i0], points[i1]));
    }
  }
}
