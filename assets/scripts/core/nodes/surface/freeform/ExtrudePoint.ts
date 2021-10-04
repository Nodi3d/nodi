
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';
import NSurface from '../../../math/geometry/surface/NSurface';
import NTrimmedSurface from '../../../math/geometry/surface/NTrimmedSurface';

export default class ExtrudePoint extends NodeBase {
  get displayName (): string {
    return 'Extrude Point';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Profile surface', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('t', 'Extrusion tip', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('r', 'Resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([32]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Extrusion result', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const profile = access.getData(0) as (NSurface | NTrimmedSurface);
    const tip = access.getData(1) as NPoint;
    const resolution = access.getData(2) as number;
    access.setData(0, profile.extrudePoint(tip, resolution));
  }
}
