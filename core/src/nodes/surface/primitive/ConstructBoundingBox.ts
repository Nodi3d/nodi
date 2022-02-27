
import { DataTree } from '~/src/data/DataTree';
import { NPlane } from '~/src/math/geometry/NPlane';
import { NDomain } from '~/src/math/primitive/NDomain';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NodeBase } from '../../NodeBase';

export class ConstructBoundingBox extends NodeBase {
  get displayName (): string {
    return 'Create BBox';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Plane for bounding box', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    const domain = new NDomain(-0.5, 0.5);
    manager.add('x', 'x domain for bounding box', DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([domain.clone()]));
    manager.add('y', 'y domain for bounding box', DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([domain.clone()]));
    manager.add('z', 'z domain for bounding box', DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([domain.clone()]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('b', 'Bounding Box', DataTypes.BOX, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const dx = access.getData(1) as NDomain;
    const dy = access.getData(2) as NDomain;
    const dz = access.getData(3) as NDomain;
    const bbox = new NBoundingBox(plane, dx, dy, dz);
    access.setData(0, bbox);
  }
}
