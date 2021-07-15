
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NNurbsCurve from '../../../math/geometry/curve/NNurbsCurve';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class NurbsCurve extends NodeBase {
  get displayName (): string {
    return 'Nurbs Curve';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Curve control points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('d', 'Curve degree', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([3]));
    manager.add('p', 'Periodic curve', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting nurbs arc', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('l', 'Curve length', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  private createKnots (degree: number, num: number): number[] {
    const knots = [];
    let k, m;
    const inc = 1.0 / (num - degree);
    for (k = 0; k <= degree; k++) { knots[k] = 0; }
    for (m = 1; k < num; k++, m++) { knots[k] = m * inc; }
    for (; k <= (degree + num); k++) { knots[k] = 1.0; }
    return knots;
  }

  private createClosedKnots (degree: number, num: number): number[] {
    const knots = [];
    const inc = 1.0 / (num - degree);
    for (let k = 0, m = -degree; k <= (degree + num); k++, m++) {
      knots[k] = m * inc;
    }
    return knots;
  }

  public solve (access: DataAccess): void {
    const points = (access.getDataList(0) as NPoint[]).slice();
    let degree = access.getData(1) as number;
    const periodic = access.getData(2) as boolean;

    if (periodic && points.length > 2) {
      const head = points[0];
      const tail = points[points.length - 1];
      if (head.distanceTo(tail) > 1e-10) {
        const d0 = tail.distanceTo(head);
        const tangent = (new Vector3()).subVectors(points[1], points[0]);
        const d1 = tangent.length();
        const m = head.clone().add(tangent.normalize().multiplyScalar(-1 * Math.min(d0, d1) * 0.5));
        points.push(m);
        points.push(head);
      }
    }

    degree = Math.max(1, Math.min(points.length - 1, Math.floor(degree)));
    const knotVectors = this.createKnots(degree, points.length);

    const curve = NNurbsCurve.byKnotsControlPointsWeights(points, degree, knotVectors);
    access.setData(0, curve);
    access.setData(1, curve.length());
  }
}
