import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import FrepBase from '../../../math/frep/FrepBase';
import FrepFilter from '../../../math/frep/FrepFilter';
import FrepNodeBase from '../FrepNodeBase';

export default class TPMSSchwarzP extends FrepNodeBase {
  public get displayName (): string {
    return 'Schwarz P';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Frep to schwarz P', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('s', 'Scale', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([8.0]));
    manager.add('t', 'Thickness', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.05]));
    manager.add('b', 'Bias', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.02]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep TPMS rseult', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const frep = access.getData(0) as FrepBase;
    const scale = access.getData(1) as number;
    const thickness = access.getData(2) as number;
    const bias = access.getData(3) as number;

    const code = function (p: string): string {
      const g1 = frep.compile(p);
      const g2 = `opSchwarzP(${p}, ${scale.toFixed(4)}, ${thickness.toFixed(4)}, ${bias.toFixed(4)})`;
      return `opIntersection(${g1}, ${g2})`;
    };
    const result = new FrepFilter(code, frep, frep.boundingBox);
    access.setData(0, result);
  }
}
