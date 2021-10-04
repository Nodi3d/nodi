import { Vector2 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import { NPlane, NPoint } from '../../../math/geometry';
import { NLineCurve, NPolylineCurve, NRectangleCurve } from '../../../math/geometry/curve';
import NCurve from '../../../math/geometry/curve/NCurve';
import NodeBase from '../../NodeBase';

export default class OffsetParallelCurve extends NodeBase {
  public get displayName (): string {
    return 'ParaCOffset';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to offset', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('d', 'Offset distance', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('p', 'Plane for offset', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Curve resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([64]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Resulting curve', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const distance = access.getData(1) as number;
    const plane = access.getData(2) as NPlane;
    const resolution = access.getData(3) as number;

    let projected: Vector2[] = [];
    if (curve instanceof NPolylineCurve || curve instanceof NLineCurve || curve instanceof NRectangleCurve) {
      projected = curve.points.map((p) => {
        return plane.project(p);
      });
      if (curve.closed) {
        projected.push(plane.project(curve.points[0]));
      }
    } else {
      projected = curve.getPoints(resolution).map((p) => {
        return plane.project(p);
      });
    }

    const points = this.offset(projected, distance).map((p) => {
      const dx = plane.xAxis.clone().multiplyScalar(p.x);
      const dy = plane.yAxis.clone().multiplyScalar(p.y);
      return plane.origin.clone().add(dx).add(dy);
    });

    // detect loop & remove last
    if (points.length > 0) {
      const first = points[0];
      const last = points[points.length - 1];
      const d = first.distanceTo(last);
      if (d < 1e-10) {
        points.pop();
      }
    }

    const result = new NPolylineCurve(points, curve.closed);
    access.setData(0, result);
  }

  offset (points: Vector2[], offset: number, leftSide: boolean = false): Vector2[] {
    if (points.length < 2) {
      return points;
    }

    const parallel: Vector2[] = [];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const point1 = this.perpendicular(a, b, offset, leftSide);
      const point2 = this.perpendicular(b, a, offset, !leftSide);
      parallel.push(point1);
      parallel.push(point2);
    }
    // return parallel;
    return this.cut(parallel);
  }

  isLinesIntersect (a: Vector2, b: Vector2, c: Vector2, d: Vector2): boolean {
    const v1 = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x);
    const v2 = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x);
    const v3 = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const v4 = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x);
    return (v1 * v2 < 0) && (v3 * v4 < 0);
  }

  intersectPoint (a: Vector2, b: Vector2, c: Vector2, d: Vector2): Vector2 {
    const z1 = b.x - a.x;
    const z2 = d.x - c.x;
    const w1 = b.y - a.y;
    const w2 = d.y - c.y;
    const k = (z1 * (c.y - a.y) + w1 * (a.x - c.x)) / (w1 * z2 - z1 * w2);
    const px = c.x + z2 * k;
    const py = c.y + w2 * k;
    return new Vector2(px, py);
  }

  cut (points: Vector2[]): Vector2[] {
    if (points.length < 4) {
      return points;
    }

    const toRemove = [];
    for (let i = 3; i < points.length; i++) {
      const a1 = points[i - 3];
      const a2 = points[i - 2];
      const b1 = points[i - 1];
      const b2 = points[i];
      const intersected = this.isLinesIntersect(a1, a2, b1, b2);
      if (intersected) {
        const point = this.intersectPoint(a1, a2, b1, b2);
        a2.x = point.x;
        a2.y = point.y;
        toRemove.push(i - 1);
      }
    }
    const first = points[0];
    const second = points[1];
    const last = points[points.length - 1];
    const prevLast = points[points.length - 2];
    if (this.isLinesIntersect(first, second, prevLast, last)) {
      const point = this.intersectPoint(first, second, prevLast, last);
      points[0].x = point.x;
      points[0].y = point.y;
      points[points.length - 1].x = point.x;
      points[points.length - 1].y = point.y;
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
      points.splice(toRemove[i], 1);
    }
    return points;
  }

  perpendicular (a: Vector2, b: Vector2, d: number, leftSide: boolean): Vector2 {
    const angle = 90 / (180 / Math.PI);
    if (leftSide) {
      return new Vector2(
        a.x + d * Math.cos(Math.atan2(b.y - a.y, b.x - a.x) + angle),
        a.y + d * Math.sin(Math.atan2(b.y - a.y, b.x - a.x) + angle)
      );
    } else {
      return new Vector2(
        a.x + d * Math.cos(Math.atan2(b.y - a.y, b.x - a.x) - angle),
        a.y + d * Math.sin(Math.atan2(b.y - a.y, b.x - a.x) - angle)
      );
    }
  }
}
