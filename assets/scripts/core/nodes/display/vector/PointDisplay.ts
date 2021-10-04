import NVTextSprite from '../../../../viewer/elements/NVTextSprite';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataAccessor from '../../../data/DataAccessor';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPoint from '../../../math/geometry/NPoint';
import { IElementable } from '../../../misc/IElementable';
import IDisplayNode from '../../IDisplayNode';
import NodeBase from '../../NodeBase';

export default class PointDisplay extends NodeBase implements IDisplayNode {
  public get displayName (): string {
    return 'P Dis';
  }

  public get previewable (): true {
    return true;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Points to display', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('s', 'Text size', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (_access: DataAccess): void {
  }

  display (): IElementable[] {
    const da = new DataAccessor(this.inputManager, this.outputManager);
    const count = da.getInCount();

    let index = 0;
    const elements: IElementable[] = [];
    for (let i = 0; i < count; i++) {
      da.iterate(this, i, (_, access) => {
        const point = access.getData(0) as NPoint;
        const size = access.getData(1) as number;

        const sprite = new NVTextSprite(index.toString(), 'black', size);
        sprite.position.copy(point);
        elements.push(sprite);
        index++;
      });
    }

    return elements;
  }
}
