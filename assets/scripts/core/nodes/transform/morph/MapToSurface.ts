import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NSurface from '../../../math/geometry/surface/NSurface';
import NodeBase from '../../NodeBase';

export default class MapToSurface extends NodeBase {
  get displayName (): string {
    return 'Map Srf';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to map', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('s', 'Base surface for initial coordinate space', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('t', 'Surface for target coordinate space', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Mapped curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const source = access.getData(1) as NSurface;
    const target = access.getData(2) as NSurface;

    const result = curve.transform((p) => {
      const uv = source.closestParam(p);
      return target.point(uv.x, uv.y);
    });
    access.setData(0, result);
  }
}
