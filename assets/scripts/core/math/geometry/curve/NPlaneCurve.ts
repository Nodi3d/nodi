import { Vector2, Vector3 } from 'three';
import NBoundingBox from '../NBoundingBox';
import NPlane from '../NPlane';
import NCurve from './NCurve';

export default abstract class NPlaneCurve extends NCurve {
  public getCurvePlane (): NPlane {
    return this.plane;
  }

  protected plane: NPlane;

  constructor (plane = new NPlane()) {
    super();
    this.plane = plane;
  }

  public getPlane (): NPlane {
    return this.plane;
  }

  public project (point: Vector3): Vector2 {
    return this.projectPointOnPlane(point, this.plane);
  }

  public bounds (plane: NPlane): NBoundingBox {
    const nurbs = this.toNurbsCurve();
    const resolution = 16;
    const inv = 1 / (resolution - 1);
    const points = [];
    for (let i = 0; i < resolution; i++) {
      const u = i * inv;
      points.push(nurbs.getPointAt(u));
    }
    return NBoundingBox.fromPoints(plane, points);
  }

  public toString (): string {
    return 'NPlaneCurve';
  }
}
