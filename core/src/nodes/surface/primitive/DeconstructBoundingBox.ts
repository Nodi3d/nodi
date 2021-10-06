
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NodeBase } from '../../NodeBase';

export class DeconstructBoundingBox extends NodeBase {
  get displayName (): string {
    return 'DeBBox';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Box to deconstruct', DataTypes.BOX, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Base plane', DataTypes.PLANE, AccessTypes.ITEM);
    manager.add('x', 'X dimension of box', DataTypes.DOMAIN, AccessTypes.ITEM);
    manager.add('y', 'Y dimension of box', DataTypes.DOMAIN, AccessTypes.ITEM);
    manager.add('z', 'Z dimension of box', DataTypes.DOMAIN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const bb = access.getData(0) as NBoundingBox;
    access.setData(0, bb.plane);
    access.setData(1, bb.dx);
    access.setData(2, bb.dy);
    access.setData(3, bb.dz);
  }
}
