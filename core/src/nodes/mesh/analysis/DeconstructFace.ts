
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFace } from '../../../math/geometry/mesh/NFace';
import { NodeBase } from '../../NodeBase';

export class DeconstructFace extends NodeBase {
  get displayName (): string {
    return 'DeFace';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Base face', DataTypes.FACE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('a', 'Index of first face vertex', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('b', 'Index of second face vertex', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('c', 'Index of third face vertex', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const face = access.getData(0) as NFace;
    access.setData(0, face.a);
    access.setData(1, face.b);
    access.setData(2, face.c);
  }
}
