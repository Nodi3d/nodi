import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import FrepShape from '../../../math/frep/FrepShape';
import FrepTransform from '../../../math/frep/FrepTransform';
import { NBoundingBox, NPlane, NPoint } from '../../../math/geometry';
import { NDomain } from '../../../math/primitive';
import FrepNodeBase from '../FrepNodeBase';

export default class FBox extends FrepNodeBase {
  public get displayName (): string {
    return 'FBox';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Base position', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('x', 'Box width', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('y', 'Box height', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('z', 'Box depth', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Frep box', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const v = access.getData(0) as NPoint;
    let w = access.getData(1) as number;
    let h = access.getData(2) as number;
    let d = access.getData(3) as number;
    w = Math.max(w, Number.EPSILON);
    h = Math.max(h, Number.EPSILON);
    d = Math.max(d, Number.EPSILON);

    const f = function (p: string) {
      return `sdBox(${p}, vec3(${w.toFixed(2)}, ${h.toFixed(2)}, ${d.toFixed(2)}))`;
    };
    const plane = new NPlane();
    const bb = new NBoundingBox(
      plane,
      new NDomain(-w * 0.5, w * 0.5),
      new NDomain(-h * 0.5, h * 0.5),
      new NDomain(-d * 0.5, d * 0.5)
    );
    const shape = new FrepShape(f, bb);
    const tr = new FrepTransform(shape, v);
    access.setData(0, tr);
  }
}
