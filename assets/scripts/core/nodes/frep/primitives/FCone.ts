import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import FrepMatrix from '../../../math/frep/FrepMatrix';
import FrepShape from '../../../math/frep/FrepShape';
import { NBoundingBox, NPlane, NPoint } from '../../../math/geometry';
import { NDomain } from '../../../math/primitive';
import FrepNodeBase from '../FrepNodeBase';

export default class FCone extends FrepNodeBase {
  public get displayName (): string {
    return 'FCone';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Base position', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('h', 'Height', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('tr', 'Top radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.2]));
    manager.add('br', 'Bottom radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Frep cone', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const v = access.getData(0) as NPoint;
    let h = access.getData(1) as number;
    let tr = access.getData(2) as number;
    let br = access.getData(3) as number;
    h = Math.max(h, Number.EPSILON);
    tr = Math.max(tr, Number.EPSILON);
    br = Math.max(br, Number.EPSILON);

    const s = Math.max(tr, br);
    const f = function (p: string) {
      return `sdCappedCone(${p}, ${(h * 0.5).toFixed(2)}, ${br.toFixed(2)}, ${tr.toFixed(2)})`;
    };
    const plane = new NPlane();
    const bb = new NBoundingBox(
      plane,
      new NDomain(-s, s),
      new NDomain(-s, s),
      new NDomain(-h * 0.5, h * 0.5)
    );
    const shape = new FrepShape(f, bb);
    const frep = FrepMatrix.create(shape, v);
    access.setData(0, frep);
  }
}
