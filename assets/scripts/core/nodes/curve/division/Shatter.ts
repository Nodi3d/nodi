import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NodeBase from '../../NodeBase';

export default class Shatter extends NodeBase {
  get displayName (): string {
    return 'Shatter';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curve to trim', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('p', 'Parameter to split at', DataTypes.NUMBER, AccessTypes.LIST);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('s', 'Shatterred remains', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const parameters = access.getDataList(1) as number[];

    const sorted = parameters.slice().sort((u0, u1) => {
      return (u0 < u1) ? -1 : 1;
    });
    const curves = curve.trims(sorted);
    access.setDataList(0, curves);
  }
}
