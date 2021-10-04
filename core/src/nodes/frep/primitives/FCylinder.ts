import { Matrix4, Quaternion, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepMatrix } from '../../../math/frep/NFrepMatrix';
import { NFrepShape } from '../../../math/frep/NFrepShape';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NPoint } from '../../../math/geometry/NPoint';
import { NPlane } from '../../../math/geometry/NPlane';
import { NDomain } from '../../../math/primitive/NDomain';
import { FrepNodeBase } from '../FrepNodeBase';

export class FCylinder extends FrepNodeBase {
  public get displayName (): string {
    return 'FCylinder';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Base position', DataTypes.POINT | DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('h', 'Height', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('r', 'Radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Frep cylinder', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0) as (NPoint | NPlane);
    let h = access.getData(1) as number;
    let r = access.getData(2) as number;
    h = Math.max(h, Number.EPSILON);
    r = Math.max(r, Number.EPSILON);

    const f = function (p: string) {
      return `sdCylinder(${p}, ${r.toFixed(2)}, ${h.toFixed(2)})`;
    };
    const plane = new NPlane();
    const bb = new NBoundingBox(
      plane,
      new NDomain(-r, r),
      new NDomain(-h * 0.5, h * 0.5),
      new NDomain(-r, r)
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
