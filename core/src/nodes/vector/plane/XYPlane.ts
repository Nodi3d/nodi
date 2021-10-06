import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class XYPlane extends NodeBase {
  get displayName (): string {
    return 'XY Plane';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Origin of plane', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'XY plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const o = access.getData(0) as NPoint;
    const dx = new Vector3(1, 0, 0);
    const dy = new Vector3(0, 1, 0);
    const normal = new Vector3().crossVectors(dx, dy);
    access.setData(0, new NPlane(o, dx, dy, normal));
  }
}
