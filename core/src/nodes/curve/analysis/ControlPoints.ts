import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class ControlPoints extends NodeBase {
  get displayName (): string {
    return 'Control Points';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to evaluate', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Control points of the nurbs form', DataTypes.POINT, AccessTypes.LIST);
    manager.add('w', 'Weights of control points.', DataTypes.NUMBER, AccessTypes.LIST);
    manager.add('k', 'Knots of control points.', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;

    const nurbs = curve.toNurbsCurve();

    access.setDataList(0, nurbs.controlPoints().map(p => new NPoint(p.x, p.y, p.z)));
    access.setDataList(1, nurbs.weights());
    access.setDataList(2, nurbs.knots());
  }
}
