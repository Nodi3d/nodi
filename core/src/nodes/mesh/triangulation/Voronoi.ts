
import { Vector3 } from 'three';
import { Delaunay } from 'd3-delaunay';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NSurface } from '../../../math/geometry/surface/NSurface';
import { NodeBase } from '../../NodeBase';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';

export class Voronoi extends NodeBase {
  get displayName (): string {
    return 'Voronoi';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Points for voronoi diagram', DataTypes.POINT, AccessTypes.LIST);
    manager.add('r', 'Cell radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('s', 'Containment boundary for diagram', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('p', 'Base plane', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Edges of the connectivity diagram (line curve)', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const points = access.getDataList(0) as NPoint[];
    const radius = access.getData(1) as number;
    const surface = access.getData(2) as NSurface;
    const plane = access.getData(3) as NPlane;

    const p2d = points.map((p) => {
      const v = plane.project(p);
      return [v.x, v.y];
    });

    let xmin = Number.MAX_VALUE;
    let ymin = Number.MAX_VALUE;
    let xmax = Number.MIN_VALUE;
    let ymax = Number.MIN_VALUE;

    surface.controlPoints().forEach((points) => {
      points.forEach((p) => {
        const p3 = new Vector3(p.x, p.y, p.z);
        const projected = plane.project(p3);
        xmin = Math.min(xmin, projected.x);
        ymin = Math.min(ymin, projected.y);
        xmax = Math.max(xmax, projected.x);
        ymax = Math.max(ymax, projected.y);
      });
    });

    const cells: NCurve[] = [];
    if (p2d.length > 0) {
      const delaunay = Delaunay.from(p2d);
      const voronoi = delaunay.voronoi([xmin, ymin, xmax, ymax]);
      const polygons = voronoi.cellPolygons();
      for (const polygon of polygons) {
        const points = polygon.map((p) => {
          return plane.origin.clone().add(plane.xAxis.clone().multiplyScalar(p[0]).add(plane.yAxis.clone().multiplyScalar(p[1])));
        });
        cells.push(new NPolylineCurve(points, true));
      }
    }

    access.setDataList(0, cells);
  }
}
