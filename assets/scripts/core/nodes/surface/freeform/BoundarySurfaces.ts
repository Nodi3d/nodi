
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NPlane from '../../../math/geometry/NPlane';
import NodeBase from '../../NodeBase';

import verb from '../../../lib/verb/verb';
import NTrimmedSurface from '../../../math/geometry/surface/NTrimmedSurface';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';

export default class BoundarySurfaces extends NodeBase {
  get displayName (): string {
    return 'Boundary Surfaces';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Boundary curves', DataTypes.CURVE, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('s', 'Boundary surface', DataTypes.SURFACE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curves = access.getDataList(0) as NCurve[];

    const boundaries = [this.getProjectedBoundary(curves[0], curves[0].getCurvePlane())];

    // Grouping curves which have a same plane & overlapped boundary region.
    // 同じPlaneを持ち、Boundaryを包含しているCurve同士をグルーピングする
    for (let i = 1, n = curves.length; i < n; i++) {
      const curve = curves[i];
      const pl0 = curve.getCurvePlane();
      let included = false;

      for (let j = 0, m = boundaries.length; j < m; j++) {
        const bry = boundaries[j];
        const pl1 = bry.plane;

        const match = Math.abs(pl1.normal.dot(pl0.normal)) >= 1.0;
        if (match) {
          // boundary to test
          const tbry = this.getProjectedBoundary(curve, pl1);

          const xmin0 = bry.xmin; const xmax0 = bry.xmax;
          const xmin1 = tbry.xmin; const xmax1 = tbry.xmax;
          const ymin0 = bry.ymin; const ymax0 = bry.ymax;
          const ymin1 = tbry.ymin; const ymax1 = tbry.ymax;

          // 0 includes 1 or 1 includes 0
          included = (
            ((xmin0 <= xmin1 && xmax1 <= xmax0) && (ymin0 <= ymin1 && ymax1 <= ymax0)) ||
            ((xmin1 <= xmin0 && xmax0 <= xmax1) && (ymin1 <= ymin0 && ymax0 <= ymax1))
          );

          if (included) {
            // add a curve to existed boundary
            bry.xmin = Math.min(xmin0, xmin1);
            bry.ymin = Math.min(ymin0, ymin1);
            bry.xmax = Math.max(xmax0, xmax1);
            bry.ymax = Math.max(ymax0, ymax1);
            bry.curves.push(curve);

            break;
          }
        }
      }

      if (!included) {
        const newBoundary = this.getProjectedBoundary(curve, pl0);
        boundaries.push(newBoundary);
      }
    }

    const surfaces = boundaries.map((boundary) => {
      const plane = boundary.plane;
      const xmin = boundary.xmin;
      const ymin = boundary.ymin;
      const xmax = boundary.xmax;
      const ymax = boundary.ymax;

      const corners = [
        plane.origin.clone().add(plane.xAxis.clone().multiplyScalar(xmin).add(plane.yAxis.clone().multiplyScalar(ymin))),
        plane.origin.clone().add(plane.xAxis.clone().multiplyScalar(xmax).add(plane.yAxis.clone().multiplyScalar(ymin))),
        plane.origin.clone().add(plane.xAxis.clone().multiplyScalar(xmax).add(plane.yAxis.clone().multiplyScalar(ymax))),
        plane.origin.clone().add(plane.xAxis.clone().multiplyScalar(xmin).add(plane.yAxis.clone().multiplyScalar(ymax)))
      ].map(p => [p.x, p.y, p.z]);

      const surface = verb.geom.NurbsSurface.byCorners(corners[0], corners[1], corners[2], corners[3]);
      return new NTrimmedSurface(surface, boundary.plane, boundary.curves);
    });

    access.setDataList(0, surfaces);
  }

  private getProjectedBoundary (curve: NCurve, plane: NPlane) {
    let projected: Vector2[] = [];

    if (curve instanceof NPolylineCurve) {
      projected = curve.points.map((p) => {
        return curve.projectPointOnPlane(p, plane);
      });
    } else {
      const resol = 16;
      const inv = 1.0 / (resol - 1);
      for (let i = 0; i < resol; i++) {
        const u = i * inv;
        const p = curve.projectPointOnPlane(curve.getPointAt(u), plane);
        projected.push(p);
      }
    }

    let xmin: number = Number.MAX_VALUE;
    let ymin: number = Number.MAX_VALUE;
    let xmax: number = Number.MIN_VALUE;
    let ymax: number = Number.MIN_VALUE;
    projected.forEach((p) => {
      xmin = Math.min(xmin, p.x);
      ymin = Math.min(ymin, p.y);
      xmax = Math.max(xmax, p.x);
      ymax = Math.max(ymax, p.y);
    });

    return {
      plane: plane.clone(),
      curves: [curve],
      xmin,
      xmax,
      ymin,
      ymax
    };
  }
}
