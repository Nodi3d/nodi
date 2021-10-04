
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NodeBase } from '../../NodeBase';

type SuccessTryJoinResult = {
  result: true;
  curve: NCurve;
};

type FailureTryJoinResult = {
  result: false;
};

type SupportedCurveType = NLineCurve | NPolylineCurve;

export class JoinCurves extends NodeBase {
  get displayName (): string {
    return 'CJoin';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curves to join', DataTypes.CURVE, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Joined curves and individual curves that could not be joined.', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curves = access.getDataList(0) as NCurve[];

    const result = this.join(curves.slice());
    access.setDataList(0, result);
  }

  private join (curves: NCurve[]): NCurve[] {
    curves.forEach((crv) => {
      if (
        !(crv instanceof NLineCurve || crv instanceof NPolylineCurve)
      ) {
        throw new TypeError('Only lines and polylines are supported for join operation.');
      }
    });

    if (curves.length <= 0) {
      return [];
    }

    let joined = curves[0];
    curves.splice(0, 1);

    let found = true;
    while (curves.length > 0 && found) {
      found = false;
      for (let i = 0, n = curves.length; i < n; i++) {
        const tried = this.tryJoin(joined as SupportedCurveType, curves[i] as SupportedCurveType);
        if (tried.result) {
          joined = tried.curve;
          curves.splice(i, 1);
          i--;
          n--;

          found = true;
        }
      }
    }

    return [joined].concat(curves);
  }

  private join2 (head: SupportedCurveType, tail: SupportedCurveType) {
    let points = head.points;
    if (head.closed && points.length > 0) {
      points.push(points[0].clone());
    }

    const points2 = tail.points;
    const origin2 = points2.slice();
    if (points2.length > 0) {
      points2.splice(0, 1);
    }
    points = points.concat(points2);

    if (tail.closed && tail.closed && origin2.length > 0) {
      points.push(origin2[0].clone());
    }

    return new NPolylineCurve(points);
  }

  private tryJoin (source: SupportedCurveType, target: SupportedCurveType): SuccessTryJoinResult | FailureTryJoinResult {
    const s1 = source.getPointAt(1);
    const t0 = target.getPointAt(0);

    if (s1.distanceTo(t0) <= 1e-10) {
      return {
        result: true,
        curve: this.join2(source, target)
      };
    }

    const s0 = source.getPointAt(0);
    if (s0.distanceTo(t0) <= 1e-10) {
      return {
        result: true,
        curve: this.join2(source.flip(), target)
      };
    }

    const t1 = target.getPointAt(1);
    if (t1.distanceTo(s0) <= 1e-10) {
      return {
        result: true,
        curve: this.join2(target, source)
      };
    }

    if (s1.distanceTo(t1) <= 1e-10) {
      return {
        result: true,
        curve: this.join2(source, target.flip())
      };
    }

    return {
      result: false
    };
  }
}
