
import { Vector3 } from 'three';
import verb from '../../../lib/verb/verb';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import NSurface from '../../../math/geometry/surface/NSurface';
import NCurve from '../../../math/geometry/curve/NCurve';
import DataTree from '../../../data/DataTree';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NDomain from '../../../math/primitive/NDomain';
import NNurbsCurve from '../../../math/geometry/curve/NNurbsCurve';

export default class Revolution extends NodeBase {
  get displayName (): string {
    return 'Revolution';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Profile curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('a', 'Revoltion axis curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('d', 'Angle domain (in radians)', DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(0, Math.PI)]));
    manager.add('r', 'Resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([16]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Surface representing the revolution result', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const profile = (access.getData(0) as NCurve).toNurbsCurve();
    const axisCurve = access.getData(1) as NCurve;
    const angle = access.getData(2) as NDomain;

    const center = new Vector3();
    const axis = this.getAxis(axisCurve, center);
    const theta = angle.end - angle.start;

    // rotate profile for angle.start
    const points = profile.controlPoints().map((cp) => {
      const vp = new Vector3(cp.x, cp.y, cp.z);
      const sub = (new Vector3()).subVectors(vp, center);
      const l = axis.dot(sub);
      const O = axis.clone().multiplyScalar(l);
      const xAxis = (new Vector3()).subVectors(vp, O);
      const r = xAxis.length();
      const yAxis = (new Vector3()).crossVectors(xAxis, axis);
      xAxis.normalize();
      yAxis.normalize();
      const np = (new Vector3()).addVectors(
        xAxis.multiplyScalar(r * Math.cos(-angle.start)),
        yAxis.multiplyScalar(r * Math.sin(-angle.start))
      );
      np.add(O);
      return np;
    });

    const curve = NNurbsCurve.byPoints(
      points,
      3
    );
    const data = new verb.geom.RevolvedSurface(curve.verb, [0, 0, 0], axis.toArray(), theta);
    const surface = new NSurface(data);
    access.setData(0, surface);
  }

  private getAxis (curve: NCurve, center: Vector3): Vector3 {
    let points: Vector3[] = [];

    if (curve instanceof NPolylineCurve) {
      const tpoints = curve.points;
      points = tpoints.slice();
      if (tpoints.length > 0 && curve.closed) {
        points.push(tpoints[0]);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const u = i / 7;
        const p = curve.getPointAt(u);
        points.push(p);
      }
    }

    if (points.length >= 2 && this.isStraight(points)) {
      center.copy(points[0]);
      return (new Vector3()).subVectors(points[1], points[0]).normalize();
    }

    throw new Error('Cannot get axis vector from input axis curve');
  }

  private isStraight (points: Vector3[]): boolean {
    if (points.length < 2) {
      return false;
    }

    const dir = (new Vector3()).subVectors(points[1], points[0]).normalize();
    for (let i = 1, n = points.length - 1; i < n; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const dir2 = (new Vector3()).subVectors(p1, p0).normalize();
      if (dir.dot(dir2) < 1 - 1e-10) {
        return false;
      }
    }

    return true;
  }
}
