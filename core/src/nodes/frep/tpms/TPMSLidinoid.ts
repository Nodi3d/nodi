import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepBase } from '../../../math/frep/NFrepBase';
import { NFrepFilter } from '../../../math/frep/NFrepFilter';
import { FrepNodeBase } from '../FrepNodeBase';

export class TPMSLidinoid extends FrepNodeBase {
  public get displayName (): string {
    return 'Lidinoid';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Frep to lidinoid', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('s', 'Scale', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([8.0]));
    manager.add('t', 'Thickness', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.05]));
    manager.add('b', 'Bias', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.02]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep TPMS rseult', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const frep = access.getData(0) as NFrepBase;
    const scale = access.getData(1) as number;
    const thickness = access.getData(2) as number;
    const bias = access.getData(3) as number;

    const code = function (p: string): string {
      const g1 = frep.compile(p);
      const g2 = `opLidinoid(${p}, ${scale.toFixed(4)}, ${thickness.toFixed(4)}, ${bias.toFixed(4)})`;
      return `opIntersection(${g1}, ${g2})`;
    };
    const result = new NFrepFilter(code, frep, frep.boundingBox);
    access.setData(0, result);
  }
}
