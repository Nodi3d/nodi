
import clipper from 'clipper-lib';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import RegionCSGNode from './RegionCSGNode';

export default class RegionIntersection extends RegionCSGNode {
  get displayName (): string {
    return 'Region Intersection';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('a', 'First planar closed curve', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('b', 'Second planar closed curves set', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('n', 'Non-polyline curve resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([64]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Curve intersection result', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as NCurve;
    const b = access.getDataList(1) as NCurve[];
    const resolution = access.getData(2) as number;

    const curves = [a].concat(b);
    if (!this.validatePlanarClosedCurves(curves)) {
      throw new Error('Non planar closed curve included in inputs');
    }

    const region = this.getCurvePaths(curves, resolution);
    const clip = new clipper.Clipper();
    region.paths.forEach((path: any, i: number) => {
      if (i === 0) {
        clip.AddPaths([path], clipper.PolyType.ptSubject, true);
      } else {
        clip.AddPaths([path], clipper.PolyType.ptClip, true);
      }
    });
    const solution = new clipper.Paths();
    clip.Execute(clipper.ClipType.ctIntersection, solution, clipper.PolyFillType.pftNonZero, clipper.PolyFillType.pftNonZero);
    const result = this.getSolutionPolylines(solution, region.plane);
    access.setDataList(0, result);
  }
}
