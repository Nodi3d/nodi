
import { Matrix4, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import { isTransformable } from '../../../math/geometry/ITransformable';
import NodeBase from '../../NodeBase';

export default class Move extends NodeBase {
  get displayName (): string {
    return 'Move';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('v', 'Translation vector', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(1, 0, 0)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Moved geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const translation = access.getData(1) as Vector3;

    const m = new Matrix4();
    m.makeTranslation(translation.x, translation.y, translation.z);

    if (isTransformable(geometry)) {
      const result = geometry.applyMatrix(m);
      access.setData(0, result);
    }
  }
}
