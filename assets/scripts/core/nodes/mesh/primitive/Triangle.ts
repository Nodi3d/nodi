
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFace from '../../../math/geometry/mesh/NFace';
import NodeBase from '../../NodeBase';

export default class Triangle extends NodeBase {
  get displayName (): string {
    return 'Triangle';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('a', 'Index of first face corner', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('b', 'Index of second face corner', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('c', 'Index of third face corner', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([2]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Triangular mesh face', DataTypes.FACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as number;
    const b = access.getData(1) as number;
    const c = access.getData(2) as number;
    access.setData(0, new NFace(a, b, c));
  }
}
