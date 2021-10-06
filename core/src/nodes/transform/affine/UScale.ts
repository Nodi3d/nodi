
import { Matrix4, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPoint } from '../../../math/geometry/NPoint';
import { isTransformable } from '../../../math/geometry/ITransformable';
import { NodeBase } from '../../NodeBase';

export class UScale extends NodeBase {
  get displayName (): string {
    return 'UScale';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('p', 'Center of scaling', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('f', 'Scaling factor', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Scaled geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const center = access.getData(1) as NPoint;
    const factor = access.getData(2) as number;

    const matrix = this.scalePointMatrix(center, factor);
    if (isTransformable(geometry)) {
      const transformed = geometry.applyMatrix(matrix);
      access.setData(0, transformed);
    }
  }

  private scalePointMatrix (center: Vector3, factor: number): Matrix4 {
    const m = new Matrix4();
    const add = (new Matrix4()).makeTranslation(center.x, center.y, center.z);
    const sub = (new Matrix4()).makeTranslation(-center.x, -center.y, -center.z);
    const scale = (new Matrix4()).makeScale(factor, factor, factor);
    m.multiply(add);
    m.multiply(scale);
    m.multiply(sub);
    return m;
  }
}
