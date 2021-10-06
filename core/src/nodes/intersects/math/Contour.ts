import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NFace } from '../../../math/geometry/mesh/NFace';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

type LayerType = {
  points: NPoint[];
  closed: boolean;
};

class MeshEdge {
  start: NPoint;
  end: NPoint;
  faces: NFace[];

  constructor (start: NPoint, end: NPoint, face: NFace) {
    this.start = start;
    this.end = end;
    this.faces = [face];
  }

  // add a face which has this edge
  public addFace (face: NFace): void {
    this.faces.push(face);
  }

  public isNeighbor (other: MeshEdge): boolean {
    const found = this.faces.find(face => other.faces.includes(face));
    return found !== undefined;
  }
}

class Intersection {
  point: NPoint;
  edge: MeshEdge;

  constructor (point: NPoint, edge: MeshEdge) {
    this.point = point;
    this.edge = edge;
  }
}

export class Contour extends NodeBase {
  get displayName (): string {
    return 'Contour';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Mesh to contour', DataTypes.MESH, AccessTypes.ITEM);
    manager.add('p', 'Contour start point', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('n', 'Contour normal direction', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('d', 'Distance between contours', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting contour curves', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const mesh = access.getData(0) as NMesh;
    const point = access.getData(1) as NPoint;
    const direction = access.getData(2) as Vector3;
    const step = access.getData(3) as number;

    if (step <= 0.0) {
      throw new Error('Step must be greater than 0.');
    }

    const layers = this.computeMeshContour(mesh, point, direction, step);
    const result = layers.filter(layer => layer.length > 0).map((paths) => {
      return paths.map(path => new NPolylineCurve(path.points, path.closed));
    });
    access.setDataList(0, result);
  }

  // get planes aligned bounding box walls
  private getBoundingPlanes (bb: NBoundingBox): NPlane[] {
    const { min, max } = bb.getMinMax();
    const p0 = new NPoint(min.x, min.y, min.z);
    const p1 = new NPoint(max.x, min.y, min.z);
    const p2 = new NPoint(max.x, min.y, max.z);
    const p3 = new NPoint(min.x, min.y, max.z);
    const p4 = new NPoint(min.x, max.y, min.z);
    const p5 = new NPoint(max.x, max.y, min.z);
    const p6 = new NPoint(max.x, max.y, max.z);
    const p7 = new NPoint(min.x, max.y, max.z);

    const l = p0.clone().add(p3.clone()).add(p4.clone()).add(p7.clone()).multiplyScalar(0.25);
    const r = p1.clone().add(p2.clone()).add(p5.clone()).add(p6.clone()).multiplyScalar(0.25);

    const d = p0.clone().add(p1.clone()).add(p2.clone()).add(p3.clone()).multiplyScalar(0.25);
    const t = p4.clone().add(p5.clone()).add(p6.clone()).add(p7.clone()).multiplyScalar(0.25);

    const f = p2.clone().add(p3.clone()).add(p6.clone()).add(p7.clone()).multiplyScalar(0.25);
    const b = p0.clone().add(p1.clone()).add(p4.clone()).add(p5.clone()).multiplyScalar(0.25);

    return [
      NPlane.fromOriginNormal(l, new Vector3(-1, 0, 0)),
      NPlane.fromOriginNormal(r, new Vector3(1, 0, 0)),
      NPlane.fromOriginNormal(d, new Vector3(0, -1, 0)),
      NPlane.fromOriginNormal(t, new Vector3(0, 1, 0)),
      NPlane.fromOriginNormal(f, new Vector3(0, 0, 1)),
      NPlane.fromOriginNormal(b, new Vector3(0, 0, -1))
    ];
  }

  private findDuplicatedIntersection (point: Vector3, intersections: Intersection[]): Intersection {
    const found = intersections.find(other => other.point.distanceToSquared(point) < Number.EPSILON);
    return found as Intersection;
  }

  private findNeighborIntersection (target: Intersection, intersections: Intersection[]): number {
    if (intersections.length <= 0) {
      return -1;
    }

    const idx = intersections.findIndex((other) => {
      return other.edge.isNeighbor(target.edge);
    });
    if (idx >= 0) {
      return idx;
    }

    return -1;
  }

  private groupIntersections (intersections: Intersection[]): Intersection[][] {
    const groups: Intersection[][] = [];
    while (intersections.length > 0) {
      const group = this.sortIntersections(intersections);
      groups.push(group);
    }

    return groups;
  }

  private sortIntersections (intersections: Intersection[]): Intersection[] {
    if (intersections.length <= 0) {
      return [];
    }

    // Pop start position
    let current = intersections.pop() as Intersection;
    const sorted = [current];

    while (intersections.length > 0) {
      const idx = this.findNeighborIntersection(current, intersections);
      if (idx >= 0) {
        current = intersections[idx] as Intersection; // next intersection
        sorted.push(current);
        intersections.splice(idx, 1);
      } else {
        // console.warn('neighbor intersection not found')
        // return []
        break;
      }
    }

    return sorted;
  }

  // Get intersection points between bounding box of geometry & direction vector
  private getCorners (mesh: NMesh, direction: Vector3): { point: Vector3; dot: number }[] {
    const bb = mesh.bounds(new NPlane());
    const planes = this.getBoundingPlanes(bb);
    const center = bb.center();

    const dline = new NLineCurve(center, center.clone().add(direction.clone().multiplyScalar(100000)));
    const dline2 = new NLineCurve(center, center.clone().add(direction.clone().multiplyScalar(-100000)));

    const intersections: Vector3[] = [];
    for (let i = 0, n = planes.length; i < n; i++) {
      const intersection = planes[i].findLineIntersection(dline.a, dline.b);
      // check a point is on a plane aligned bounding box
      if (
        intersection !== undefined &&
        intersection.distanceToSquared(dline.a) > Number.EPSILON
      ) {
        intersections.push(intersection);
        continue;
      }

      const intersection2 = planes[i].findLineIntersection(dline2.a, dline2.b);
      if (
        intersection2 !== undefined &&
        intersection2.distanceToSquared(dline2.a) > Number.EPSILON
      ) {
        intersections.push(intersection2);
      }
    }

    const corners = intersections.map((intersection) => {
      const sub = (new Vector3()).subVectors(intersection, center);
      return {
        point: intersection,
        dot: sub.dot(direction)
      };
    });

    return corners.sort((c0, c1) => {
      if (c0.dot < c1.dot) {
        return -1;
      } else if (c0.dot === c1.dot) {
        return 0;
      }
      return 1;
    });
  }

  private computeMeshContour (mesh: NMesh, point: NPoint, direction: Vector3, step: number) {
    direction = direction.clone().normalize();

    const vertices = mesh.vertices;
    const faces = mesh.faces;

    const center = mesh.center();
    const corners = this.getCorners(mesh, direction);

    if (corners.length < 2) {
      throw new Error('Cannot find an intersection point between axis line & input geometry');
    }

    const start = corners[0].point;
    const end = corners[corners.length - 1].point;

    // Use point as offset
    {
      let offset = point.clone().sub(start);
      offset = offset.projectOnVector(direction);
      const axis = end.clone().sub(start).projectOnVector(direction);
      const len = Math.min(offset.length(), axis.length());
      offset.setLength(len);
      if (offset.dot(axis) > 0) {
        offset = offset.multiplyScalar(-1);
      }
      start.add(offset);
    }

    const toCorner: Vector3 = (new Vector3()).subVectors(end, start);
    const axis: Vector3 = toCorner.projectOnVector(direction);

    let count: number = 0;
    if (step > 0) {
      count = axis.length() / step;
    } else {
      throw new Error('Distance must be less than 0');
    }

    // console.log(step, count)

    count = Math.max(0, Math.floor(count));

    const dict: { [index:string]: MeshEdge } = {};
    const edges: MeshEdge[] = [];

    const addEdge = (i0: number, i1: number, face: NFace) => {
      let a, b;
      if (i0 <= i1) {
        a = i0;
        b = i1;
      } else {
        a = i1;
        b = i0;
      }
      const key = `${a}-${b}`;
      if (!dict[key]) {
        const pa = vertices[a];
        const pb = vertices[b];

        const edge = new MeshEdge(pa, pb, face);
        edges.push(edge);
        dict[key] = edge;
      } else {
        dict[key].addFace(face);
      }
    };

    faces.forEach((face) => {
      addEdge(face.a, face.b, face);
      addEdge(face.b, face.c, face);
      addEdge(face.c, face.a, face);
    });
    const ln = edges.length;

    const layers: LayerType[][] = [];

    for (let i = 0; i < count; i++) {
      const origin = start.clone().add(direction.clone().multiplyScalar(i * step));

      const pt = NPoint.fromVector(origin);
      const plane = NPlane.fromOriginNormal(pt, direction);
      // console.log(origin.length(), origin.clone(), origin.clone().projectOnVector(direction), origin.clone().projectOnVector(direction).length())
      if (plane.distanceToPoint(origin) !== 0) {
        // console.log(origin, plane.constant, plane.distanceToPoint(origin));
      }

      const intersections = [];
      for (let j = 0; j < ln; j++) {
        // Planeと交差したEdgeと点位置を保持
        const v = plane.findLineIntersection(edges[j].start, edges[j].end);
        if (v !== undefined && this.findDuplicatedIntersection(v, intersections) === undefined) {
          const intersection = new Intersection(new NPoint(v.x, v.y, v.z), edges[j]);
          intersections.push(intersection);
        }
      }

      const icount = intersections.length;

      // Grouping intersections by connected triangles
      const groups = this.groupIntersections(intersections);
      const paths: LayerType[] = groups.filter(grp => grp.length >= 2).map((grp) => {
        return {
          points: grp.map(isn => isn.point),
          closed: (grp.length === icount)
        };
      });
      layers.push(paths);
    }

    return layers;
  }
}
