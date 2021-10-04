
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NodeBase } from '../../NodeBase';

export class CrossProduct extends NodeBase {
  get displayName (): string {
    return 'Cross';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'First vector', DataTypes.VECTOR | DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('s', 'Second vector', DataTypes.VECTOR | DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Cross product of input vectors', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0);
    const b = access.getData(1);

    const dA: Vector3 = this.getTangent(a);
    const dB: Vector3 = this.getTangent(b);
    access.setData(0, new Vector3().crossVectors(dA, dB));
  }

  private getTangent (v: any): Vector3 {
    if (v instanceof NCurve) {
      return v.getTangentAt(0);
    } else if (v instanceof Vector3) {
      return v.clone();
    }

    throw new Error(`${v} is not Vector3 or Curve`);
  }
}
