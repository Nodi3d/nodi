
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPoint from '../../../math/geometry/NPoint';
import NSurface from '../../../math/geometry/surface/NSurface';
import NodeBase from '../../NodeBase';

export default class SurfaceClosestPoint extends NodeBase {
  get displayName (): string {
    return 'Surface Closest Point';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Sample point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('s', 'Surface to search', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Closest point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('c', '{uv} coordinate of closest point', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('d', 'Distance between sample point and surface', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const point = access.getData(0) as NPoint;
    const surface = access.getData(1) as NSurface;

    const closest = NPoint.fromVector(surface.closestPoint(point));
    const uv = surface.closestParam(closest);
    access.setData(0, closest);
    access.setData(1, uv);
    access.setData(2, point.distanceTo(closest));
  }
}
