
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class Polyline extends NodeBase {
  get displayName (): string {
    return 'Polyline';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Polyline vertex points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('c', 'Closed polyline or not', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting polyline curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const points = access.getDataList(0) as NPoint[];
    const closed = access.getData(1) as boolean;

    const curve = new NPolylineCurve(points.slice(), closed);
    access.setData(0, curve);
  }
}
