
import { Matrix4, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { isTransformable } from '../../../math/geometry/ITransformable';
import { NodeBase } from '../../NodeBase';

export class NUScale extends NodeBase {
  get displayName (): string {
    return 'NUScale';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('p', 'Base plane', DataTypes.POINT | DataTypes.PLANE, AccessTypes.ITEM);
    manager.add('x', 'Scaling factor in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('y', 'Scaling factor in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('z', 'Scaling factor in z direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Scaled geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const base = access.getData(1) as (NPlane | NPoint);
    const sx = access.getData(2) as number;
    const sy = access.getData(3) as number;
    const sz = access.getData(4) as number;

    let plane: NPlane;
    if (base instanceof NPoint) {
      plane = new NPlane(base);
    } else {
      plane = base;
    }

    const matrix = this.uscalePointMatrix(plane, sx, sy, sz);
    if (isTransformable(geometry)) {
      access.setData(0, geometry.applyMatrix(matrix));
    }
  }

  uscalePointMatrix (plane: NPlane, sx: number, sy: number, sz: number) {
    const m = new Matrix4();
    const center = plane.origin;
    const add = (new Matrix4()).makeTranslation(center.x, center.y, center.z);
    const sub = (new Matrix4()).makeTranslation(-center.x, -center.y, -center.z);

    const dx = plane.xAxis.clone().multiplyScalar(sx);
    const dy = plane.yAxis.clone().multiplyScalar(sy);
    const dz = plane.normal.clone().multiplyScalar(sz);
    const factor = dx.add(dy).add(dz);
    const scale = (new Matrix4()).makeScale(factor.x, factor.y, factor.z);
    m.multiply(add);
    m.multiply(scale);
    m.multiply(sub);
    return m;
  }
}
