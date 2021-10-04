
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class Amplitude extends NodeBase {
  get displayName (): string {
    return 'Amplitude';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('v', 'Base vector', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('a', 'Amplitude (length) value', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('r', 'Resulting vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const vector = access.getData(0) as Vector3;
    const amplitude = access.getData(1) as number;
    access.setData(0, vector.clone().normalize().multiplyScalar(amplitude));
  }
}
