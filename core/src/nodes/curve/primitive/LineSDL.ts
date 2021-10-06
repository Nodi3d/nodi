
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class LineSDL extends NodeBase {
  get displayName (): string {
    return 'Line SDL';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Start point of line curve', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('t', 'Line tangent', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('l', 'Line length', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting line curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const start = access.getData(0) as NPoint;
    const tangent = access.getData(1) as Vector3;
    const length = access.getData(2) as number;

    const end = start.clone().add(tangent.clone().setLength(length));
    const curve = new NLineCurve(start, end);
    access.setData(0, curve);
  }
}
