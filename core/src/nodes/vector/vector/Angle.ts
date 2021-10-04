
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NodeBase } from '../../NodeBase';

export class Angle extends NodeBase {
  get displayName (): string {
    return 'Angle';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'First vector', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('s', 'Second vector', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('p', 'Optional plane for 2D angle', DataTypes.PLANE, AccessTypes.ITEM).setOptional(true);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('a', 'Angle (in radians) between vectors', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as Vector3;
    const b = access.getData(1) as Vector3;
    const plane = access.getData(2) as NPlane;
    if (plane !== undefined) {
      access.setData(0, this.angle2D(a, b, plane));
    } else {
      access.setData(0, this.angle3D(a, b));
    }
  }

  private angle3D (a: Vector3, b: Vector3) {
    return a.angleTo(b);
  }

  private angle2D (a: Vector3, b: Vector3, plane: NPlane) {
    const projA = a.clone().projectOnPlane(plane.normal);
    const projB = b.clone().projectOnPlane(plane.normal);

    const pa2 = new Vector2(plane.xAxis.dot(projA), plane.yAxis.dot(projA));
    const pb2 = new Vector2(plane.xAxis.dot(projB), plane.yAxis.dot(projB));

    return pb2.angle() - pa2.angle();
  }
}
