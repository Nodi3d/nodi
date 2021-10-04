
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NLineCurve from '../../../math/geometry/curve/NLineCurve';
import { intersectsCurveCurve } from '../../../math/geometry/NIntersection';
import NPlane from '../../../math/geometry/NPlane';
import NPoint from '../../../math/geometry/NPoint';
import NodeBase from '../../NodeBase';

export default class ProjectPoint extends NodeBase {
  get displayName (): string {
    return 'Project Point';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Point to project', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('v', 'Projection direction', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('c', 'Curve to project onto', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Projecdted point', DataTypes.POINT, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const point = access.getData(0) as NPoint;
    const direction = access.getData(1) as Vector3;
    const curve = access.getData(2) as NCurve;

    const l = direction.length();
    const plane = NPlane.fromOriginNormal(new NPoint(), direction.clone().normalize());
    const bb = curve.bounds(plane);
    const length = Math.max(bb.dx.size, bb.dy.size, bb.dz.size);
    const line = new NLineCurve(point.clone(), point.clone().add(direction.clone().setLength(Math.max(l, length * 2))));

    const intersections = intersectsCurveCurve(line, curve);
    const points: { distance: number; point: NPoint }[] = [];
    intersections.forEach((ip) => {
      const distance = ip.position.distanceTo(point);
      if (distance > 1e-8) {
        points.push({
          distance,
          point: ip.position
        });
      }
    });

    const distances = points.map(p => p.distance);
    const min = Math.min(...distances);
    const idx = distances.indexOf(min);
    if (points.length > 0) {
      access.setData(0, points[idx].point);
    } else {
      access.setData(0, undefined);
    }
  }
}
