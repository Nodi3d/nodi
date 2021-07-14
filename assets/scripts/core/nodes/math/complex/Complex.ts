import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NComplexNumber from '../../../math/primitive/NComplexNumber';
import NodeBase from '../../NodeBase';

export default class Complex extends NodeBase {
  get displayName (): string {
    return 'Complex';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('r', 'Real component of complex number', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('i', 'Imaginary component of complex number', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('O', 'Complex number', DataTypes.COMPLEX, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const real = access.getData(0);
    const imag = access.getData(1);
    access.setData(0, new NComplexNumber(real, imag));
  }
}
