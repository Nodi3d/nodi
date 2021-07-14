
import { CylinderGeometry, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NMesh from '../../../math/geometry/mesh/NMesh';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class Cylinder extends NodeBase {
  get displayName (): string {
    return 'Cylinder';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base position', DataTypes.PLANE | DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('r', 'Radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
    manager.add('h', 'Height', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('s', 'Radial segments', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([16]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', '3D mesh sphere', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0);
    const r = Math.max(Number.EPSILON, access.getData(1) as number);
    const h = Math.max(Number.EPSILON, access.getData(2) as number);
    const segments = access.getData(3) as number;

    const geometry = new CylinderGeometry(r, r, h, Math.max(3, Math.floor(segments)), 1, false);
    if (base instanceof NPoint) {
      const matrix = new Matrix4();
      matrix.makeTranslation(base.x, base.y, base.z);
      geometry.applyMatrix4(matrix);
    } else {
      const pl = base as NPlane;
      const matrix = new Matrix4();
      const q = new Quaternion();
      q.setFromEuler(pl.rotation());
      matrix.compose(pl.origin, q, new Vector3(1, 1, 1));
      geometry.applyMatrix4(matrix);
    }
    const mesh = NMesh.fromBufferGeometry(geometry);
    access.setData(0, mesh);
  }
}
