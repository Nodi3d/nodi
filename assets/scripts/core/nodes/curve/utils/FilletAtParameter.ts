
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import { concatFilletPoints, getCornerFilletPoints } from '../../../math/geometry/FilletCurveHelper';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class FilletAtParameter extends NodeBase {
  get displayName (): string {
    return 'Fillet Param';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Polyline Curve to fillet', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Curve parameter for fillet', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('r', 'Radius to fillet', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('r', 'Polyline resolution for filleted corners', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([32]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Curve with filleted corners', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const parameter = access.getData(1) as number;
    const radius = access.getData(2) as number;
    const resolution = access.getData(3) as number;

    if (!(curve instanceof NPolylineCurve)) {
      throw new TypeError('Fillet only accepts Polyline Curve');
    }

    const result = this.applyFillet(curve, parameter, radius, resolution);
    access.setData(0, result);
  }

  private applyFillet (curve: NPolylineCurve, parameter: number, radius: number, resolution: number): NPolylineCurve {
    const point = curve.getPointAt(parameter);
    const points = curve.points;

    let idx = 0;
    let min = points[0].distanceToSquared(point);
    for (let i = 1, n = points.length; i < n; i++) {
      const d = points[i].distanceToSquared(point);
      if (d < min) {
        idx = i;
        min = d;
      }
    }

    if (min <= radius * 0.5 && idx >= 0) {
      let sequence: NPoint[] = [];
      const len = points.length;
      let i0 = idx - 1;
      let i1 = idx + 1;

      // 最初か最後の点を参照している場合はclosedなCurveでないと処理できない
      if ((i0 < 0 || len <= i1) && !curve.closed) {
        return curve;
      }

      i0 = (i0 < 0) ? (len + i0) : i0;
      i1 = i1 % len;

      // console.log(i0, idx, i1, len)

      if (i0 < i1) {
        for (let i = 0; i < idx; i++) {
          sequence.push(points[i]);
        }
      }

      const p0 = points[i0];
      const p1 = points[idx];
      const p2 = points[i1];
      sequence = concatFilletPoints(sequence, getCornerFilletPoints(p0, p1, p2, radius, resolution, 1));

      if (i0 < i1) {
        const tail = points.slice().splice(i1, len - i1);
        sequence = concatFilletPoints(sequence, tail);
      } else {
        const tail = points.slice().splice(i1, i0 - i1 + 1);
        sequence = concatFilletPoints(sequence, tail);
      }

      return new NPolylineCurve(sequence, curve.closed);
    }

    return curve;
  }
}
