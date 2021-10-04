
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { isBoundable } from '../../../math/geometry/IBoundable';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NSurface } from '../../../math/geometry/surface/NSurface';
import { NDomain } from '../../../math/primitive/NDomain';
import { NodeBase } from '../../NodeBase';

export class Area extends NodeBase {
  get displayName (): string {
    return 'm²';
  }

  public registerInputs (manager: InputManager): void {
    const type = DataTypes.CURVE | DataTypes.MESH | DataTypes.SURFACE | DataTypes.BOX;
    manager.add('g', 'Mesh or planar closed curve for area computation', type, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('a', 'Area of geometry', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('p', 'Area centroid of geometry', DataTypes.POINT, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const geom = access.getData(0) as (NCurve | NMesh | NSurface | NBoundingBox);

    const area = geom.area();
    const center = geom.center();

    access.setData(0, area);
    access.setData(1, center);
  }
}
