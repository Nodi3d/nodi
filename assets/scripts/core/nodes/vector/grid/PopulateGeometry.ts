
import { Vector2 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NSurface from '../../../math/geometry/surface/NSurface';
import PoissonDiskSampling from '../../../math/misc/PoissonDiskSampling';
import NodeBase from '../../NodeBase';

export default class PopulateGeometry extends NodeBase {
  get displayName (): string {
    return 'Populate Geometry';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Geometry to populate', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('c', 'Count', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([20]));
    manager.add('s', 'Seed', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Population of inserted points', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const geom = access.getData(0) as NSurface;
    const count = access.getData(1) as number;
    const seed = access.getData(2) as number;

    const corners = [
      new Vector2(0, 0),
      new Vector2(1, 1)
    ];
    const points = PoissonDiskSampling.sample(corners, count, seed);
    const result = points.map((p) => {
      return geom.point(p.x, p.y);
    });

    access.setDataList(0, result);
  }
}
