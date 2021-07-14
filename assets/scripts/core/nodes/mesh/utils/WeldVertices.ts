
import { BufferGeometry, BufferGeometryUtils, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NMesh from '../../../math/geometry/mesh/NMesh';
import GeometryUtils from '../../../math/GeometryUtils';
import NodeBase from '../../NodeBase';

class Duplicates {
  points: Vector3[];
  indices: number[];

  constructor (point: Vector3, index: number) {
    this.points = [point];
    this.indices = [index];
  }

  public add (p: Vector3, i: number): void {
    this.points.push(p);
    this.indices.push(i);
  }

  public contains (p: Vector3, distance: number): boolean {
    return (this.points.find(other => other.distanceTo(p) <= distance) !== undefined);
  }

  public average (): Vector3 {
    const ave = new Vector3();
    this.points.forEach((p) => {
      ave.add(p);
    });
    return ave.divideScalar(this.points.length);
  }
}

export default class WeldVertices extends NodeBase {
  get displayName (): string {
    return 'Weld Vertices';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Mesh to weld vertices', DataTypes.MESH, AccessTypes.ITEM);
    manager.add('t', 'Threshold (distance between vertices) to weld', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1e-1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Mesh welded result', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const mesh = access.getData(0) as NMesh;
    const threshold = access.getData(1) as number;

    const cloned = mesh.clone();
    const result = this.weld(cloned, Math.max(0, threshold));
    access.setData(0, result);
  }

  private weld (mesh: NMesh, threshold: number): NMesh {
    const inputs = mesh.vertices.slice();
    const n = inputs.length;
    const groups = [];
    for (let i = 0; i < n; i++) {
      const p = inputs[i];
      const found = groups.find(grp => grp.contains(p, threshold));
      if (found !== undefined) {
        found.add(p, i);
      } else {
        groups.push(new Duplicates(p, i));
      }
    }

    groups.forEach((grp) => {
      const ave = grp.average();
      grp.indices.forEach((idx) => {
        mesh.vertices[idx].copy(ave);
      });
    });

    // TODO:
    mesh.mergeVertices();
    // geometry.computeVertexNormals();

    return mesh;
  }
}
