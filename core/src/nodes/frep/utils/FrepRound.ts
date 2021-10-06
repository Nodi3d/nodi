import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepBase } from '../../../math/frep/NFrepBase';
import { NFrepFilter } from '../../../math/frep/NFrepFilter';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NDomain } from '../../../math/primitive/NDomain';
import { FrepNodeBase } from '../FrepNodeBase';

export class FrepRound extends FrepNodeBase {
  public get displayName (): string {
    return 'FRound';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Base frep', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('r', 'Rounding amount', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep rounded result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const frep = access.getData(0) as NFrepBase;
    const amount = access.getData(1) as number;

    const code = function (p: string): string {
      const g = frep.compile(p);
      return `${g} - ${amount.toFixed(2)}`;
    };
    const dx = frep.boundingBox.dx;
    const dy = frep.boundingBox.dy;
    const dz = frep.boundingBox.dz;

    const sx = dx.start - amount; const ex = dx.end + amount;
    const sy = dy.start - amount; const ey = dy.end + amount;
    const sz = dz.start - amount; const ez = dz.end + amount;
    const bb = new NBoundingBox(
      frep.boundingBox.plane,
      (ex > sx) ? new NDomain(sx, ex) : new NDomain(0, 0),
      (ey > sy) ? new NDomain(sy, ey) : new NDomain(0, 0),
      (ez > sz) ? new NDomain(sz, ez) : new NDomain(0, 0)
    );
    const result = new NFrepFilter(code, frep, bb);
    access.setData(0, result);
  }
}
