import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NComplexNumber } from '../../../math/primitive/NComplexNumber';
import { NodeBase } from '../../NodeBase';

export class DeconstructComplex extends NodeBase {
  get displayName (): string {
    return 'DeComplex';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Complex number to deconstruct', DataTypes.COMPLEX, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('r', 'Real component of complex number', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('i', 'Imaginary component of complex number', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const c = access.getData(0) as NComplexNumber;
    access.setData(0, c.real);
    access.setData(1, c.imag);
  }
}
