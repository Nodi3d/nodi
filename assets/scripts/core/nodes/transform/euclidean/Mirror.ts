
import { Matrix4, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NMesh from '../../../math/geometry/mesh/NMesh';
import NPlane from '../../../math/geometry/NPlane';
import { isTransformable } from '../../../math/geometry/ITransformable';
import NodeBase from '../../NodeBase';

export default class Mirror extends NodeBase {
  get displayName (): string {
    return 'Mirror';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('p', 'Mirror plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Mirrored geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const plane = access.getData(1) as NPlane;

    const matrix = this.getMirrorMatrix(plane);

    if (isTransformable(geometry)) {
      const result = geometry.applyMatrix(matrix);
      if (result instanceof NMesh) {
        access.setData(0, result.flip());
      } else {
        access.setData(0, result);
      }
    }
  }

  private getMirrorMatrix (plane: NPlane) {
    const center = plane.origin;
    const m = new Matrix4();
    const T = (new Matrix4()).makeTranslation(center.x, center.y, center.z);
    const scale = plane.xAxis.clone().add(plane.yAxis).add(plane.normal.clone().multiplyScalar(-1));
    const sz = (new Matrix4()).makeScale(scale.x, scale.y, scale.z);
    const IT = (new Matrix4()).makeTranslation(-center.x, -center.y, -center.z);
    m.multiply(T);
    m.multiply(sz);
    m.multiply(IT);
    return m;
  }
}
