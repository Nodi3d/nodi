import { Color, Vector3 } from 'three';
import { NVArrow } from '@/src/preview/elements/NVArrow';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataAccessor } from '../../../data/DataAccessor';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPoint } from '../../../math/geometry/NPoint';
import { IElementable } from '../../../misc/IElementable';
import { IDisplayNode } from '../../IDisplayNode';
import { NodeBase } from '../../NodeBase';

export class VectorDisplay extends NodeBase implements IDisplayNode {
  public get displayName (): string {
    return 'V Dis';
  }

  public get previewable (): true {
    return true;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Origin points for vector', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('v', 'Vectors to display', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('l', 'Length of vector', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (_access: DataAccess): void {
  }

  public display (): IElementable[] {
    const da = new DataAccessor(this.inputManager, this.outputManager);
    const count = da.getInCount();

    let index = 0;
    const elements: IElementable[] = [];
    for (let i = 0; i < count; i++) {
      da.iterate(this, i, (_, access) => {
        const point = access.getData(0) as NPoint;
        const v = access.getData(1) as Vector3;
        const len = access.getData(2) as number;

        const nv = v.clone().normalize();
        let n = nv.clone();
        n = n.addScalar(1.0);
        n = n.multiplyScalar(0.5);

        const arrow = new NVArrow(nv, point, len, new Color(n.x, n.y, n.z), len * 0.25, len * 0.25);
        elements.push(arrow);

        index++;
      });
    }

    return elements;
  }
}
