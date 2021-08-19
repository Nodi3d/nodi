import { Matrix4, Quaternion, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFrepMatrix from '../../../math/frep/NFrepMatrix';
import NFrepShape from '../../../math/frep/NFrepShape';
import { NBoundingBox, NPlane, NPoint } from '../../../math/geometry';
import { NDomain } from '../../../math/primitive';
import FrepNodeBase from '../FrepNodeBase';

export default class FBox extends FrepNodeBase {
  public get displayName (): string {
    return 'FBox';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Base position', DataTypes.POINT | DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('x', 'Box width', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('y', 'Box height', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('z', 'Box depth', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Frep box', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0) as (NPoint | NPlane);
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
    const matrix = new Matrix4();
    if (base instanceof NPoint) {
      matrix.makeTranslation(base.x, base.y, base.z);
    } else {
      const pl = base as NPlane;
      const q = new Quaternion();
      q.setFromEuler(pl.rotation());
      matrix.compose(pl.origin, q, new Vector3(1, 1, 1));
    }
    const shape = new NFrepShape(f, bb);
    const tr = new NFrepMatrix(shape, matrix);
    access.setData(0, tr);
  }
}
