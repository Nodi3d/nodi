
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NodeBase } from '../../NodeBase';

export class DeconstructPlane extends NodeBase {
  get displayName (): string {
    return 'DePlane';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Plane to deconstruct', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Origin point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('x', 'X-Axis vector', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('y', 'Y-Axis vector', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('z', 'Z-Axis vector', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    access.setData(0, plane.origin.clone());
    access.setData(1, plane.xAxis.clone());
    access.setData(2, plane.yAxis.clone());
    access.setData(3, plane.normal.clone());
  }
}
