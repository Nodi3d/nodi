import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import NDomain from '../../../math/primitive/NDomain';
import DataTree from '../../../data/DataTree';

export default class Domain extends NodeBase {
  get displayName (): string {
    return 'Domain';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Start value of numeric domain', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('e', 'End value of numeric domain', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('d', 'Numeric domain', DataTypes.DOMAIN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as number;
    const b = access.getData(1) as number;
    const domain = new NDomain(Math.min(a, b), Math.max(a, b));
    access.setData(0, domain);
  }
}
