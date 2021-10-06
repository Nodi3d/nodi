import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NComplexNumber } from '../../../math/primitive/NComplexNumber';
import { NodeBase } from '../../NodeBase';

export class Absolute extends NodeBase {
  get displayName (): string {
    return '|x|';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Input value', DataTypes.NUMBER | DataTypes.COMPLEX, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Output value', DataTypes.NUMBER | DataTypes.COMPLEX, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const n = access.getData(0);
    if (n instanceof NComplexNumber) {
      access.setData(0, n.abs());
    } else {
      access.setData(0, Math.abs(n));
    }
  }
}
