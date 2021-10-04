
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

enum CullMethods {
  LEAVEONE,
  CULLALL,
  AVERAGE,
}

type CullResultType = {
  points: NPoint[];
  indices: number[];
  counts: number[];
};

class Duplicates {
  points: NPoint[];
  index: number;

  constructor (point: NPoint, index: number) {
    this.points = [point];
    this.index = index;
  }

  add (p: NPoint): void {
    this.points.push(p);
  }

  contains (p: NPoint, distance: number): boolean {
    // return p.distanceTo(this.points[0]) <= distance
    return (this.points.find(other => other.distanceTo(p) <= distance) !== undefined);
    // return this.average().distanceTo(p) <= distance
  }

  average (): NPoint {
    const ave = new NPoint();
    this.points.forEach((p) => {
      ave.add(p);
    });
    return ave.divideScalar(this.points.length);
  }
}

export class CullDuplicates extends NodeBase {
  protected method: CullMethods = CullMethods.AVERAGE;

  get displayName (): string {
    return 'CullPt';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Points to operate on', DataTypes.POINT, AccessTypes.LIST);
    manager.add('d', 'Proxymity tolerance distance', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Culled points', DataTypes.POINT, AccessTypes.LIST);

    // Culled pointsが元のinput pointsの中でどこのindexだったか
    // Averageのように新しく生成されたPointの場合は-1でよい
    manager.add('i', 'Index map of culled points', DataTypes.NUMBER, AccessTypes.LIST);

    // Culled pointsの各Pointがdistanceに含むinput pointsの数
    manager.add('d', 'Number of input points represented  by this output point', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const points = access.getDataList(0) as NPoint[];
    const distance = access.getData(1) as number;

    let result: CullResultType;
    switch (this.method) {
      case CullMethods.LEAVEONE:
        result = this.leaveOne(points, distance);
        break;
      case CullMethods.CULLALL:
        result = this.cullAll(points, distance);
        break;
      case CullMethods.AVERAGE:
        result = this.average(points, distance);
        break;
    }

    access.setDataList(0, result.points);
    access.setDataList(1, result.indices);
    access.setDataList(2, result.counts);
  }

  private dupGroup (points: NPoint[], distance: number) {
    const inputs = points.slice();
    const n = inputs.length;
    const groups = [];
    for (let i = 0; i < n; i++) {
      const p = inputs[i];
      const found = groups.find(grp => grp.contains(p, distance));
      if (found !== undefined) {
        found.add(p);
      } else {
        groups.push(new Duplicates(p, i));
      }
    }
    return groups;
  }

  private leaveOne (points: NPoint[], distance: number): CullResultType {
    const outputs = [];
    const indices = [];
    const counts = [];

    const inputs = points.slice();
    let n = inputs.length;

    for (let i = 0; i < n; i++) {
      const p = inputs[i];
      const group = [p];
      for (let j = i + 1; j < n; j++) {
        const other = inputs[j];
        if (p.distanceTo(other) <= distance) {
          group.push(other);
          inputs.splice(j, 1);
          n--;
          j--;
        }
      }
      outputs.push(p);
      indices.push(i);
      counts.push(group.length);
    }

    return {
      points: outputs,
      indices,
      counts
    };
  }

  private cullAll (points: NPoint[], distance: number): CullResultType {
    const groups = this.dupGroup(points, distance).filter(grp => grp.points.length <= 1);
    const outputs = groups.map(grp => grp.points[0]);
    const indices = groups.map(grp => grp.index);
    const counts = groups.map(grp => 1);
    return {
      points: outputs,
      indices,
      counts
    };
  }

  private average (points: NPoint[], distance: number): CullResultType {
    const groups = this.dupGroup(points, distance);
    const outputs = groups.map((grp) => {
      if (grp.points.length <= 1) {
        return grp.points[0];
      } else {
        return grp.average();
      }
    });
    const indices = groups.map((grp) => {
      if (grp.points.length <= 1) {
        return grp.index;
      } else {
        return -1;
      }
    });
    const counts = groups.map(grp => grp.points.length);
    return {
      points: outputs,
      indices,
      counts
    };
  }
}
