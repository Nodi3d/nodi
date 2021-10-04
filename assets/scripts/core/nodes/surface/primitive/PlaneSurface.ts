
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import NSurface from '../../../math/geometry/surface/NSurface';
import NDomain from '../../../math/primitive/NDomain';
import NodeBase from '../../NodeBase';

export default class PlaneSurface extends NodeBase {
  get displayName (): string {
    return 'Plane Surface';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Surface base plane', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('x', 'Dimensions in x direction', DataTypes.NUMBER | DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(0, 1)]));
    manager.add('y', 'Dimensions in y direction', DataTypes.NUMBER | DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(0, 1)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('s', 'Resulting surface', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const x = access.getData(1) as (number | NDomain);
    const y = access.getData(2) as (number | NDomain);

    const degree: number = 1;
    const knots = [0, 0, 0.333, 0.666, 1, 1];
    const resolution = knots.length - (degree + 1);

    let xmin: number, ymin: number;
    let xlen: number, ylen: number;

    if (x instanceof NDomain) {
      xmin = x.start;
      xlen = x.size;
    } else {
      xmin = 0;
      xlen = x;
    }

    if (y instanceof NDomain) {
      ymin = y.start;
      ylen = y.size;
    } else {
      ymin = 0;
      ylen = y;
    }

    const inv = 1 / (resolution - 1);
    const xt = inv * xlen;
    const yt = inv * ylen;

    const offset = plane.origin.clone().add(plane.xAxis.clone().multiplyScalar(xmin).add(plane.yAxis.clone().multiplyScalar(ymin)));

    const points: Vector3[][] = [];
    for (let y = 0; y < resolution; y++) {
      const dy = plane.yAxis.clone().multiplyScalar(yt * y);
      const cols: Vector3[] = [];
      for (let x = 0; x < resolution; x++) {
        const dx = plane.xAxis.clone().multiplyScalar(xt * x);
        const p = offset.clone().add(dy.clone().add(dx));
        cols.push(p);
      }
      points.push(cols);
    }

    const srf = NSurface.byKnotsControlPointsWeights(degree, degree, knots, knots, points);
    access.setData(0, srf);
  }
}
