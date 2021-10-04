import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NNurbsCurve } from '../../../math/geometry/curve/NNurbsCurve';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class PullPoint extends NodeBase {
  get displayName (): string {
    return 'Pull Point';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Points to pull', DataTypes.POINT, AccessTypes.LIST);
    manager.add('l', 'Geometry as attractors', DataTypes.POINT | DataTypes.CURVE, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Closest point', DataTypes.POINT, AccessTypes.LIST);
    manager.add('d', 'Distance to closest point', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const points = access.getDataList(0) as NPoint[];
    const attractors = access.getDataList(1) as (NPoint | NCurve)[];

    const results = points.map(p => this.calculate(p, attractors));
    access.setDataList(0, results.map(r => r.closest));
    access.setDataList(1, results.map(r => r.distance));
  }

  private distance (p: NPoint, geometry: (NPoint | NCurve)): number {
    if (geometry instanceof NPoint) { return p.distanceTo(geometry); }

    let t = 0;
    if (geometry instanceof NNurbsCurve) {
      t = geometry.closestParam(p) as number;
    } else {
      t = geometry.toNurbsCurve().closestParam(p) as number;
    }
    return p.distanceTo(geometry.getPointAt(t));
  }

  private calculate (p: NPoint, attractors: (NPoint | NCurve)[]) {
    let closest: (NPoint | NCurve) = attractors[0];
    let distance: number = this.distance(p, attractors[0]);

    const len = attractors.length;
    for (let i = 1; i < len; i++) {
      const p2 = attractors[i];
      const d2 = this.distance(p, p2);
      if (d2 < distance) {
        closest = p2;
        distance = d2;
      }
    }

    return {
      closest,
      distance
    };
  }
}
