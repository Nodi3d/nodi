
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import NComplexNumber from '../../../math/primitive/NComplexNumber';
import NodeBase from '../../NodeBase';

const SQRT3 = 1.73205080757;

export default class HexagonalSpiral extends NodeBase {
  get displayName (): string {
    return 'Hex Spiral';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Base plane for grid', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Radius of spiral cells', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('n', '# of spiral corners', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([37]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Points at spiral corners', DataTypes.POINT, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const radius = access.getData(1) as number;
    const count = access.getData(2) as number;

    const offset = plane.origin;
    const dx = plane.xAxis;
    const dy = plane.yAxis;

    const points = [];
    const r = 2 * radius / SQRT3;

    const n = count + 1;
    for (let i = 1; i < n; i++) {
      const v2 = this.pointAtHexSpiral(i);
      const v = offset.clone().add(dx.clone().multiplyScalar(v2.x * r)).add(dy.clone().multiplyScalar(v2.y * r));
      points.push(v);
    }

    access.setDataList(0, points);
  }

  private pointAtHexSpiral (index: number): Vector2 {
    const position = new Vector2();
    if (index > 1) {
      const N = Math.ceil(0.5 + (SQRT3 / 6.0) * Math.sqrt(4.0 * index - 1.0));
      const m = index - 3 * N * N + 9 * N - 8;
      const l = N - 1;
      const r = Math.floor(m / l);
      const t = (m % l) * SQRT3 * 0.5;
      const i = new NComplexNumber(0.5, SQRT3 * 0.5);
      const ir = i.pow(r + 1);
      const ir1 = i.pow(r + 2);
      const ir1t = new NComplexNumber(t, 0).mul(ir1);
      const s0 = new NComplexNumber(SQRT3 / 2.0 + (N - 2) * (SQRT3 / 4.0), -(N - 2) * 3.0 / 4.0);
      let s = s0.mul(ir);
      s = s.add(ir1t);
      position.set(s.real, s.imag);
    }
    return position;
  }
}
