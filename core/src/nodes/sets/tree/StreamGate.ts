
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';

export class StreamGate extends NodeBase {
  public get displayName (): string {
    return 'Gate';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Input stream', DataTypes.ANY, AccessTypes.TREE);
    manager.add('i', 'Gate index of output stream', DataTypes.NUMBER | DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o0', 'Output for Gate index 0', DataTypes.ANY, AccessTypes.TREE);
    manager.add('o1', 'Output for Gate index 1', DataTypes.ANY, AccessTypes.TREE);
  }

  public solve (access: DataAccess): void {
    const stream = access.getDataTree(0);
    const empty = new DataTree();

    const v = access.getData(1);

    let gate = 0;
    if ((typeof v) === 'boolean') {
      if (v) {
        gate = 1;
      } else {
        gate = 0;
      }
    } else {
      gate = v as number;
    }

    gate = Math.floor(gate);

    switch (gate) {
      case 0: {
        access.setDataTree(0, stream);
        access.setDataTree(1, empty);
        break;
      }
      case 1: {
        access.setDataTree(0, empty);
        access.setDataTree(1, stream);
        break;
      }
      default: {
        throw new Error('Index of Gate must be 0 or 1');
      }
    }
  }
}
