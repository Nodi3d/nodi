
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class UnflattenTree extends NodeBase {
  public get displayName (): string {
    return 'Unflatten';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('d', 'Data tree to unflatten', DataTypes.ANY, AccessTypes.TREE);
    manager.add('d', 'Guide data tree that defines the path layout', DataTypes.ANY, AccessTypes.TREE);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Unflatted data tree', DataTypes.ANY, AccessTypes.TREE);
  }

  public solve (access: DataAccess): void {
    const tree = access.getDataTree(0);
    const guide = access.getDataTree(1);
    access.setDataTree(0, tree.unflatten(guide));
  }
}
