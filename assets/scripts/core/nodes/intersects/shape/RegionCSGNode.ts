import clipper from 'clipper-lib';
import NCurve from '../../../math/geometry/curve/NCurve';
import NodeBase from '../../NodeBase';

import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import NPlane from '../../../math/geometry/NPlane';

const precision = 1e10;

export type IntPointType = {
  X: number;
  Y: number;
};

export type RegionPathType = {
  paths: IntPointType[][];
  plane: NPlane;
};

export default abstract class RegionCSGNode extends NodeBase {
  protected validatePlanarClosedCurves (curves: NCurve[]): boolean {
    if (curves.length <= 0) {
      return true;
    }

    const planes = curves.map((crv) => {
      const plane = crv.getCurvePlane();
      if (plane === undefined) { throw new Error('Input curve cannot define a plane'); }
      return plane;
    });

    const plane = planes[0];
    for (let i = 1, n = planes.length; i < n; i++) {
      const other = planes[i];
      const dot = Math.abs(plane.normal.dot(other.normal));
      if (dot < 1 - 1e-10) {
        return false;
      }
    }

    return true;
  }

  protected getCurvePaths (curves: NCurve[], resolution: number = 64): RegionPathType {
    const plane = curves[0].getCurvePlane();
    const points = curves.map((curve) => {
      if (curve instanceof NPolylineCurve) {
        const projected = curve.points.map((p) => {
          return plane.project(p);
        });
        if (curve.closed && projected.length > 0) {
          projected.push(projected[0].clone());
        }
        return projected;
      } else {
        return curve.getPoints(resolution).map((p) => {
          return plane.project(p);
        });
      }
    });

    const paths: IntPointType[][] = points.map((path) => {
      return path.map((p) => {
        return new clipper.IntPoint(p.x * precision, p.y * precision);
      });
    });

    return {
      paths,
      plane
    };
  }

  protected getSolutionPolylines (solution: IntPointType[][], plane: NPlane): NPolylineCurve[] {
    const paths = solution.map((path) => {
      const projected = path.map((ip) => {
        const x = ip.X / precision;
        const y = ip.Y / precision;
        const dx = plane.xAxis.clone().multiplyScalar(x);
        const dy = plane.yAxis.clone().multiplyScalar(y);
        return plane.origin.clone().add(dx).add(dy);
      });

      if (projected.length > 0) {
        const first = projected[0];
        const last = projected[projected.length - 1];
        const d = first.distanceTo(last);
        if (d < 1e-10) {
          projected.pop();
        }
      }

      return projected;
    });

    return paths.map((points) => {
      return new NPolylineCurve(points, true);
    });
  }
}
