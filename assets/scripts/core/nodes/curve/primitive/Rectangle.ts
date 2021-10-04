import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NRectangleCurve from '../../../math/geometry/curve/NRectangleCurve';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NDomain from '../../../math/primitive/NDomain';
import NodeBase from '../../NodeBase';

export default class Rectangle extends NodeBase {
  get displayName (): string {
    return 'Rectangle';
  }

  public registerInputs (manager: InputManager): void {
    const plane = new NPlane(new NPoint(0, 0, 0));
    manager.add('b', 'Base position or plane', DataTypes.POINT | DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([plane]));
    manager.add('x', 'Dimensions of rectangle in plane X direction.', DataTypes.DOMAIN | DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(-0.5, 0.5)]));
    manager.add('y', 'Dimensions of rectangle in plane Y direction.', DataTypes.DOMAIN | DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(-0.5, 0.5)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Rectangle curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0);
    const x = access.getData(1);
    const y = access.getData(2);

    let xdom: NDomain;
    let ydom: NDomain;

    if (x instanceof NDomain) {
      xdom = x;
    } else {
      const xStart = Math.min(0, x);
      const xEnd = Math.max(0, x);
      xdom = new NDomain(xStart, xEnd);
    }

    if (y instanceof NDomain) {
      ydom = y;
    } else {
      const yStart = Math.min(0, y);
      const yEnd = Math.max(0, y);
      ydom = new NDomain(yStart, yEnd);
    }

    let plane: NPlane;
    if (base instanceof NPlane) {
      plane = base.clone();
    } else {
      // point
      plane = new NPlane(base.clone());
    }

    const curve = new NRectangleCurve(plane, xdom, ydom);
    access.setData(0, curve);
  }
}
