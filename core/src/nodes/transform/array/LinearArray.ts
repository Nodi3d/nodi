
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

export class LinearArray extends NodeBase {
  get displayName (): string {
    return 'LinearArray';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('d', 'Linear array direction', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(1, 0, 0)]));
    manager.add('n', 'Number of elements in array', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([10]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Arrayed geometry', GeometryDataTypes, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const direction = access.getData(1) as Vector3;
    const count = access.getData(2) as number;

    const result = [];
    for (let i = 0; i < count; i++) {
      const v = direction.clone().multiplyScalar(i);
      const m = new Matrix4();
      m.makeTranslation(v.x, v.y, v.z);
      if (isTransformable(geometry)) {
        result.push(geometry.applyMatrix(m));
      }
    }
    access.setDataList(0, result);
  }
}
