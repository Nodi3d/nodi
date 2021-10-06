
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class PointToVector extends NodeBase {
  get displayName (): string {
    return 'Pt Vec';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Base point', DataTypes.POINT, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('v', 'Output vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const p = access.getData(0) as NPoint;
    access.setData(0, p.toVector());
  }
}
