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

export class FCone extends FrepNodeBase {
  public get displayName (): string {
    return 'FCone';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Base position', DataTypes.POINT | DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('h', 'Height', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('tr', 'Top radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.2]));
    manager.add('br', 'Bottom radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Frep cone', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const base = access.getData(0) as NPoint;
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
    const result = new NFrepMatrix(shape, matrix);
    access.setData(0, result);
  }
}
