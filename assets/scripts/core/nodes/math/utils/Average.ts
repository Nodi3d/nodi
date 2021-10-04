import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NComplexNumber from '../../../math/primitive/NComplexNumber';
import NodeBase from '../../NodeBase';

export default class Average extends NodeBase {
  get displayName (): string {
    return 'Avg';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Input values for averaging', DataTypes.NUMBER | DataTypes.VECTOR | DataTypes.COMPLEX, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Arithmetic mean (average) of all input values', DataTypes.NUMBER | DataTypes.VECTOR | DataTypes.COMPLEX, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const inputs = access.getDataList(0);
    const n = inputs.length;
    if (inputs.length > 0) {
      const example = inputs[0];
      if (example instanceof Vector3) {
        const tmp = new Vector3();
        inputs.forEach((el: Vector3) => {
          tmp.add(el);
        });
        access.setData(0, tmp.divideScalar(n));
      } else if (example instanceof NComplexNumber) {
        let tmp = new NComplexNumber();
        inputs.forEach((el: NComplexNumber) => {
          tmp = tmp.add(el);
        });
        access.setData(0, new NComplexNumber(tmp.real / n, tmp.imag / n));
      } else {
        let tmp = 0;
        inputs.forEach((el: number) => {
          tmp += el;
        });
        access.setData(0, tmp / n);
      }
    }
  }
}
