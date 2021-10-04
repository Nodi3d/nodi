
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NComplexNumber } from '../../../math/primitive/NComplexNumber';
import { NodeBase } from '../../NodeBase';

const SQRT3 = 1.73205080757;

export class RectangularSpiral extends NodeBase {
  get displayName (): string {
    return 'Rect Spiral';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('o', 'Base plane for grid', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Radius of spiral cells', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('n', '# of spiral corners', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([36]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Points at grid centers', DataTypes.POINT, AccessTypes.LIST);
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
      const v2 = this.pointAtRectSpiral(i);
      const v = offset.clone().add(dx.clone().multiplyScalar(v2.x * r)).add(dy.clone().multiplyScalar(v2.y * r));
      points.push(v);
    }

    access.setDataList(0, points);
  }

  private pointAtRectSpiral (index: number): Vector2 {
    const position = new Vector2();
    if (index > 1) {
      const N = Math.floor(Math.ceil((Math.sqrt(index) + 1) / 2));
      const m = index - (2 * N - 3) * (2 * N - 3) - 1;
      const l = (N - 1) * 2;
      const r = Math.floor(m / l);
      const t = m % l;
      const ir = (new NComplexNumber(0, 1)).pow(r + 1);
      const irt = ir.mul(new NComplexNumber(0, t));
      const s0 = new NComplexNumber(N - 1, -N + 2);
      const s = s0.mul(ir);
      const a = s.add(irt);
      position.set(a.real, a.imag);
    }
    return position;
  }
}
