
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class ShiftPaths extends NodeBase {
  public get displayName (): string {
    return 'Shift Paths';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('d', 'Data tree to flatten', DataTypes.ANY, AccessTypes.TREE);
    manager.add('o', 'Number of offset', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Resulting data tree', DataTypes.ANY, AccessTypes.TREE);
  }

  public solve (access: DataAccess): void {
    const tree = access.getDataTree(0) as DataTree;
    const offset = access.getData(1) as number;
    access.setDataTree(0, tree.shift(offset));
  }
}
