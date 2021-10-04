
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class ClosestPoints extends NodeBase {
  get displayName (): string {
    return 'CPs';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Point to search from', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('t', 'Cloud of points to search', DataTypes.POINT, AccessTypes.LIST);
    manager.add('n', 'Number of closest points to find', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Point in cloud closest to input', DataTypes.POINT, AccessTypes.LIST);
    manager.add('i', 'Index of closest point', DataTypes.NUMBER, AccessTypes.LIST);
    manager.add('d', 'Distance between input and closest point', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const point = access.getData(0) as NPoint;
    const points = access.getDataList(1) as NPoint[];
    const count = access.getData(2) as number;

    const items = points.map((other, index) => {
      return {
        point: other,
        index,
        distance: other.distanceToSquared(point)
      };
    });

    const sorted = items.sort((i0, i1) => {
      if (i0.distance < i1.distance) {
        return -1;
      } else if (i0.distance > i1.distance) {
        return 1;
      }
      return 0;
    });

    const result = [];
    for (let i = 0, n = Math.min(sorted.length, count); i < n; i++) {
      result.push(sorted[i]);
    }

    access.setDataList(0, result.map(r => r.point));
    access.setDataList(1, result.map(r => r.index));
    access.setDataList(2, result.map(r => Math.sqrt(r.distance)));
  }
}
