
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class ClosestPoint extends NodeBase {
  get displayName (): string {
    return 'CP';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Point to search from', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('t', 'Cloud of points to search', DataTypes.POINT, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Point in cloud closest to input', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('i', 'Index of closest point', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('d', 'Distance between input and closest point', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const point = access.getData(0) as NPoint;
    const points = access.getDataList(1) as NPoint[];

    let closest: number = 0;
    let distance: number = points[closest].distanceToSquared(point);

    for (let i = 1, n = points.length; i < n; i++) {
      const other = points[i];
      const d2 = other.distanceToSquared(point);
      if (d2 < distance) {
        closest = i;
        distance = d2;
      }
    }

    access.setData(0, points[closest]);
    access.setData(1, closest);
    access.setData(2, Math.sqrt(distance));
  }
}
