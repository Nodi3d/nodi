import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class CurveClosestPoint extends NodeBase {
  get displayName (): string {
    return 'Curve Closest Point';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Point to project curve', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('c', 'Input curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Point on the curve closest to the base point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('p', 'Parameter on curve domain of closest point', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('d', 'Distance between base point and curve', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const point = access.getData(0) as NPoint;
    const curve = access.getData(1) as NCurve;

    const nurbs = curve.toNurbsCurve();
    const parameter = nurbs.closestParam(point);
    if (parameter === undefined) {
      throw new Error('Closest point not found');
    }

    const closest = nurbs.getPointAt(parameter);
    access.setData(0, closest);
    access.setData(1, parameter);
    access.setData(2, point.distanceTo(closest));
  }
}
