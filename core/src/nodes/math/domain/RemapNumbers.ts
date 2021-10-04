import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NDomain } from '../../../math/primitive/NDomain';
import { NodeBase } from '../../NodeBase';

export class RemapNumbers extends NodeBase {
  get displayName (): string {
    return 'Remap';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('n', 'Number to remap', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('s', 'Source domain', DataTypes.NUMBER | DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(0, 1)]));
    manager.add('t', 'Target domain', DataTypes.NUMBER | DataTypes.DOMAIN, AccessTypes.ITEM).setDefault(new DataTree().add([new NDomain(0, 1)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('r', 'Remapped value', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const i0 = access.getData(0) as number;
    const src = access.getData(1);
    const dst = access.getData(2);

    let v01: number = 0;
    if (src instanceof NDomain) {
      v01 = src.normalize(i0);
    } else {
      v01 = (new NDomain(0, src)).normalize(i0);
    }

    let remapped: number = 0;
    if (dst instanceof NDomain) {
      remapped = dst.map(v01);
    } else {
      remapped = (new NDomain(0, dst)).map(v01);
    }

    access.setData(0, remapped);
  }
}
