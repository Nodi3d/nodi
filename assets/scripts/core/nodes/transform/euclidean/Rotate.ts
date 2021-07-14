
import { Euler, Matrix4 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes, GeometryDataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import { isTransformable } from '../../../math/geometry/ITransformable';
import NodeBase from '../../NodeBase';

export default class Rotate extends NodeBase {
  get displayName (): string {
    return 'Rotate';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Base geometry', GeometryDataTypes, AccessTypes.ITEM);
    manager.add('x', 'Rotation angle (radians) in x direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('y', 'Rotation angle (radians) in y direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('z', 'Rotation angle (radians) in z direction', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('g', 'Rotated geometry', GeometryDataTypes, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geometry = access.getData(0);
    const rx = access.getData(1) as number;
    const ry = access.getData(2) as number;
    const rz = access.getData(3) as number;
    const m = new Matrix4();
    m.makeRotationFromEuler(new Euler(rx, ry, rz));
    if (isTransformable(geometry)) {
      const result = geometry.applyMatrix(m);
      access.setData(0, result);
    }
  }
}
