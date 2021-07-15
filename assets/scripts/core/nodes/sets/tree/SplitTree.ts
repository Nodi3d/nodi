
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class SplitTree extends NodeBase {
  public get displayName (): string {
    return 'Split';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('d', 'Data tree to split', DataTypes.ANY, AccessTypes.TREE);
    manager.add('m', ' Splitting masks', DataTypes.STRING, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Positive set of data (all branches that match any of the masks)', DataTypes.ANY, AccessTypes.TREE);
    manager.add('n', 'Negative set of data (all branches that do not match any of the masks)', DataTypes.ANY, AccessTypes.TREE);
  }

  public solve (access: DataAccess): void {
    const tree = access.getDataTree(0);
    const masks = access.getDataList(1) as string[];

    const { positive, negative } = tree.split(masks.slice());
    access.setDataTree(0, positive);
    access.setDataTree(1, negative);
  }
}
