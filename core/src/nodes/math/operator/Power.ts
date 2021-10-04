import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NComplexNumber } from '../../../math/primitive/NComplexNumber';
import { NodeBase } from '../../NodeBase';

export class Power extends NodeBase {
  get displayName (): string {
    return 'Pow';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('x', 'Input value', DataTypes.NUMBER | DataTypes.COMPLEX, AccessTypes.ITEM);
    manager.add('e', 'The exponent', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Output value', DataTypes.NUMBER | DataTypes.COMPLEX, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const x = access.getData(0);
    const p = access.getData(1) as number;
    if (x instanceof NComplexNumber) {
      access.setData(0, x.pow(p));
    } else {
      access.setData(0, Math.pow(x as number, p));
    }
  }
}
