import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFrepBase from '../../../math/frep/NFrepBase';
import NFrepSmoothIntersectionBlend from '../../../math/frep/NFrepSmoothIntersectionBlend';
import FrepNodeBase from '../FrepNodeBase';

export default class FrepSmoothIntersection extends FrepNodeBase {
  public get displayName (): string {
    return 'FSmoothIntersection';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'First frep', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('s', 'Second frep set', DataTypes.FREP, AccessTypes.LIST);
    manager.add('c', 'Smooth coefficient', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep intersection result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const a = access.getData(0) as NFrepBase;
    const b = access.getDataList(1) as NFrepBase[];
    const k = access.getData(2) as number;

    const n = b.length;
    if (n <= 0) {
      access.setData(0, a);
      return;
    }

    let result = new NFrepSmoothIntersectionBlend(a, b[0], k.toFixed(2));
    for (let i = 1; i < n; i++) {
      result = new NFrepSmoothIntersectionBlend(result, b[i], k.toFixed(2));
    }
    access.setData(0, result);
  }
}
