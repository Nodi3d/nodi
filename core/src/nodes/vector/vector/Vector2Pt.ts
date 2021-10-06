
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPoint } from '../../../math/geometry/NPoint';
import { NodeBase } from '../../NodeBase';

export class Vector2Pt extends NodeBase {
  get displayName (): string {
    return 'Vec 2Pt';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('t', 'Tip point', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('u', 'Unitiaze output', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([false]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('v', 'Resuting vector', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('l', 'Vector length', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const b = access.getData(0) as NPoint;
    const t = access.getData(1) as NPoint;
    const u = access.getData(2) as boolean;
    const sub = t.clone().sub(b);
    const length = sub.length();
    const result = u ? sub.normalize() : sub;
    access.setData(0, new Vector3().copy(result));
    access.setData(1, length);
  }
}
