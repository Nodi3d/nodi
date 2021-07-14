
import { Vector3 } from 'three';
import verb from '../../../lib/verb/verb';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import NCurve from '../../../math/geometry/curve/NCurve';
import DataTree from '../../../data/DataTree';
import Helper from '../../../math/Helper';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NMesh from '../../../math/geometry/mesh/NMesh';
import FrenetFrame, { computeFrenetFrames } from '../../../math/geometry/curve/FrenetFrame';
import NFace from '../../../math/geometry/mesh/NFace';
import { TWO_PI } from '../../../math/Constant';
import NPoint from '../../../math/geometry/NPoint';
import NLineCurve from '../../../math/geometry/curve/NLineCurve';

export default class Pipe extends NodeBase {
  get displayName (): string {
    return 'Pipe';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Base curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('r', 'Pipe radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
    manager.add('c', 'Cap', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([true]));
    manager.add('r', 'Curve resolution for parametric curves', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([32]));
    manager.add('r', 'Radial resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([16]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Resulting pipe mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const radius = access.getData(1) as number;
    const cap = access.getData(2) as boolean;
    const curveResolution = access.getData(3) as number;
    const radialResolution = access.getData(4) as number;

    let points = [];
    if (
      (curve instanceof NPolylineCurve) ||
      (curve instanceof NLineCurve)
    ) {
      points = curve.points;
    } else {
      points = curve.getPoints(curveResolution);
    }
    const closed = curve.closed ?? false;
    const frames = this.computeFrenetFrames(points, closed, radius);
    const mesh = this.buildPipe(frames, cap, radialResolution);
    access.setData(0, mesh);
  }

  private buildPipe (frames: FrenetFrame[], cap: boolean, resolution: number = 8): NMesh {
    const vertices: NPoint[] = [];
    const faces: NFace[] = [];

    for (let i = 0, n = frames.length; i < n; i++) {
      const frame = frames[i];

      for (let j = 0; j < resolution; j++) {
        const t = (j / (resolution - 1)) * TWO_PI;
        const s = Math.sin(t);
        const c = Math.cos(t);

        const v = new Vector3();
        v.addVectors(v, frame.normal.clone().multiplyScalar(c));
        v.addVectors(v, frame.binormal.clone().multiplyScalar(s));
        const p = frame.origin.clone().add(v);
        vertices.push(p);
      }

      if (i < n - 1) {
        for (let j = 0; j < resolution - 1; j++) {
          const i0 = i * resolution + j;
          const i1 = i * resolution + j + 1;
          const i2 = (i + 1) * resolution + j;
          const i3 = (i + 1) * resolution + j + 1;
          faces.push(new NFace(i0, i1, i2));
          faces.push(new NFace(i3, i2, i1));
        }
      }
    }

    if (cap) {
      const head = frames[0];
      const tail = frames[frames.length - 1];
      vertices.push(head.origin);
      vertices.push(tail.origin);
      const ihead = vertices.length - 2;
      const itail = vertices.length - 1;
      const ioffset = resolution * (frames.length - 1);
      for (let i = 0; i < resolution - 1; i++) {
        const ihead0 = i;
        const ihead1 = i + 1;
        faces.push(new NFace(ihead1, ihead0, ihead));

        const itail0 = i + ioffset;
        const itail1 = i + 1 + ioffset;
        faces.push(new NFace(itail, itail0, itail1));
      }
    }

    const mesh = new NMesh();
    mesh.vertices = vertices;
    mesh.faces = faces;
    mesh.computeVertexNormals();
    return mesh;
  }

  private computeFrameCorner (prev: Vector3, cur: Vector3, next: Vector3, radius: number): { tangent: Vector3, radius: number } {
    const tan10 = cur.clone().sub(prev).normalize();
    const tan21 = next.clone().sub(cur).normalize();
    const tangent = tan10.clone().add(tan21).normalize();
    const d = Helper.clamp01((tan10.dot(tan21) + 1.0) * 0.5);
    const r = Helper.lerp(1, 0.5, d) * radius;
    return {
      tangent,
      radius: r
    };
  }

  private computeFrenetFrames (points: NPoint[], closed: boolean, radius: number): FrenetFrame[] {
    const l = points.length - 1;

    const tangents: Vector3[] = [];
    const radiuses: number[] = [];
    const hr = radius * 0.5;

    // head
    if (!closed) {
      const head = points[0];
      const next = points[1];
      const tangent = next.clone().sub(head).normalize();
      tangents.push(tangent);
      radiuses.push(hr);
    } else {
      const prev = points[l];
      const cur = points[0];
      const next = points[1];
      const result = this.computeFrameCorner(prev, cur, next, radius);
      tangents.push(result.tangent);
      radiuses.push(result.radius);
    }

    // middle
    for (let i = 1; i < l; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const next = points[i + 1];
      const result = this.computeFrameCorner(prev, cur, next, radius);
      tangents.push(result.tangent);
      radiuses.push(result.radius);
    }

    // tail
    if (!closed) {
      const prev = points[l - 1];
      const tail = points[l];
      const tangent = tail.clone().sub(prev).normalize();
      tangents.push(tangent);
      radiuses.push(hr);
    } else {
      const prev = points[l - 1];
      const cur = points[l];
      const next = points[0];
      const result = this.computeFrameCorner(prev, cur, next, radius);
      tangents.push(result.tangent);
      radiuses.push(result.radius);
    }

    const frames = computeFrenetFrames(points, tangents, closed);
    frames.forEach((frame: FrenetFrame, i: number) => {
      const r = radiuses[i % radiuses.length];
      frame.normal.setLength(r);
      frame.binormal.setLength(r);
    });
    return frames;
  }
}
