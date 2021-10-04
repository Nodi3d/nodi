import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepBase } from '../../../math/frep/NFrepBase';
import { NFrepSmoothUnionBlend } from '../../../math/frep/blends/NFrepSmoothUnionBlend';
import { FrepNodeBase } from '../FrepNodeBase';

export class FrepSmoothUnion extends FrepNodeBase {
  public get displayName (): string {
    return 'FSmoothUnion';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Frep set to union', DataTypes.FREP, AccessTypes.LIST);
    manager.add('c', 'Smooth coefficient', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep union result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const freps = access.getDataList(0) as NFrepBase[];
    const k = Math.max(1e-5, access.getData(1) as number);
    const n = freps.length;

    if (n === 1) {
      access.setData(0, freps[0]);
    } else if (n > 1) {
      let result = new NFrepSmoothUnionBlend(freps[0], freps[1], k.toFixed(2));
      for (let i = 2; i < n; i++) {
        result = new NFrepSmoothUnionBlend(result, freps[i], k.toFixed(2));
      }
      access.setData(0, result);
    }
  }
}
