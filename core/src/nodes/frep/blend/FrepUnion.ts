import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepBase } from '../../../math/frep/NFrepBase';
import { NFrepUnionBlend } from '../../../math/frep/blends/NFrepUnionBlend';
import { FrepNodeBase } from '../FrepNodeBase';

export class FrepUnion extends FrepNodeBase {
  public get displayName (): string {
    return 'FUnion';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Frep set to union', DataTypes.FREP, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep union result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const freps = access.getDataList(0) as NFrepBase[];
    const n = freps.length;

    if (n === 1) {
      access.setData(0, freps[0]);
    } else if (n > 1) {
      let result = new NFrepUnionBlend(freps[0], freps[1]);
      for (let i = 2; i < n; i++) {
        result = new NFrepUnionBlend(result, freps[i]);
      }
      access.setData(0, result);
    }
  }
}
