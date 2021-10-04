import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NComplexNumber from '../../../math/primitive/NComplexNumber';
import NodeBase from '../../NodeBase';

export default class MassMultiplication extends NodeBase {
  get displayName (): string {
    return 'MM';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('v', 'Input values for mass multiplication', DataTypes.NUMBER | DataTypes.VECTOR | DataTypes.COMPLEX, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    const type = DataTypes.NUMBER | DataTypes.VECTOR | DataTypes.COMPLEX;
    manager.add('r', 'Result of mass multiplication', type, AccessTypes.LIST);
    manager.add('l', 'List of partial results', type, AccessTypes.LIST);
  }

  public solve (access: DataAccess): Promise<void> {
    const inputs = access.getDataList(0);
    const partial: (number | Vector3 | NComplexNumber)[] = [];

    const n = inputs.length;
    if (n > 0) {
      const example = inputs[0];
      let tmp = example;
      if (example instanceof Vector3) {
        for (let i = 1; i < n; i++) {
          tmp.multiply(inputs[i] as Vector3);
          partial.push(tmp.clone());
        }
      } else if (example instanceof NComplexNumber) {
        for (let i = 1; i < n; i++) {
          tmp.mul(inputs[i] as NComplexNumber);
          partial.push(tmp.clone());
        }
      } else {
        for (let i = 1; i < n; i++) {
          tmp *= inputs[i] as number;
          partial.push(tmp);
        }
      }

      access.setDataList(0, [partial[partial.length - 1]]);
      access.setDataList(1, partial);
    }

    return Promise.resolve();
  }
}
