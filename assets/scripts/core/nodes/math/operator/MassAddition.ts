import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NComplexNumber from '../../../math/primitive/NComplexNumber';
import NodeBase from '../../NodeBase';

export default class MassAddition extends NodeBase {
  get displayName (): string {
    return 'MA';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('v', 'Input values for mass addition', DataTypes.NUMBER | DataTypes.VECTOR | DataTypes.COMPLEX, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    const type = DataTypes.NUMBER | DataTypes.VECTOR | DataTypes.COMPLEX;
    manager.add('r', 'Result of mass addition', type, AccessTypes.LIST);
    manager.add('l', 'List of partial results', type, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const inputs = access.getDataList(0);
    const partial: (number | Vector3 | NComplexNumber)[] = [];

    if (inputs.length > 0) {
      const example = inputs[0];
      if (example instanceof Vector3) {
        const tmp = new Vector3();
        inputs.forEach((el: Vector3) => {
          tmp.add(el);
          partial.push(tmp.clone());
        });
      } else if (example instanceof NComplexNumber) {
        let tmp = new NComplexNumber();
        inputs.forEach((el: NComplexNumber) => {
          tmp = tmp.add(el);
          partial.push(tmp.clone());
        });
      } else {
        let tmp = 0;
        inputs.forEach((el: number) => {
          tmp += el;
          partial.push(tmp);
        });
      }

      access.setDataList(0, [partial[partial.length - 1]]);
      access.setDataList(1, partial);
    }
  }
}
