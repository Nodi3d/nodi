
import verb from '../../../lib/verb/verb';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import NSurface from '../../../math/geometry/surface/NSurface';
import NPoint from '../../../math/geometry/NPoint';

export default class SurfaceFromPoints extends NodeBase {
  get displayName (): string {
    return 'Surface from points';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Grid of points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('n', 'Number of points in {u} direction', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Resulting surface', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const grid = access.getDataList(0) as NPoint[];
    const ucount = access.getData(1) as number;

    const rows = Math.floor(ucount);
    const cols = Math.floor(grid.length / rows);

    const degree = 3;
    const klen = rows + (degree + 1);
    const knots: number[] = [];
    for (let i = 0; i < degree; i++) {
      knots.push(0);
    }
    const len = klen - degree * 2;
    const inv = 1.0 / (len - 1);
    for (let i = 0; i < len; i++) {
      knots.push(i * inv);
    }
    for (let i = 0; i < degree; i++) {
      knots.push(1);
    }

    const points: number[][][] = [];
    for (let y = 0; y < rows; y++) {
      const off = y * cols;
      const column: number[][] = [];
      for (let x = 0; x < cols; x++) {
        const p = grid[off + x];
        column.push(p.toArray());
      }
      points.push(column);
    }

    const data = verb.geom.NurbsSurface.byKnotsControlPointsWeights(degree, degree, knots, knots, points);
    access.setData(0, new NSurface(data));
  }
}
