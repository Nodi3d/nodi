import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepBase } from '../../../math/frep/NFrepBase';
import { NFrepIntersectionBlend } from '../../../math/frep/blends/NFrepIntersectionBlend';
import { FrepNodeBase } from '../FrepNodeBase';

export class FrepIntersection extends FrepNodeBase {
  public get displayName (): string {
    return 'FIntersection';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'First frep', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('s', 'Second frep set', DataTypes.FREP, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep intersection result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as NFrepBase;
    const b = access.getDataList(1) as NFrepBase[];

    const n = b.length;
    if (n <= 0) {
      access.setData(0, a);
      return;
    }

    let result = new NFrepIntersectionBlend(a, b[0]);
    for (let i = 1; i < n; i++) {
      result = new NFrepIntersectionBlend(result, b[i]);
    }
    access.setData(0, result);
  }
}
