
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class VectorToPoint extends NodeBase {
  get displayName (): string {
    return 'Vec Pt';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('v', 'Input vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Resulting point', DataTypes.POINT, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const v = access.getData(0) as Vector3;
    access.setData(0, new NPoint(v.x, v.y, v.z));
  }
}
