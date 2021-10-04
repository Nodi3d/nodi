import NVClipping from '../../../../viewer/elements/NVClipping';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataAccessor from '../../../data/DataAccessor';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NMesh from '../../../math/geometry/mesh/NMesh';
import NPlane from '../../../math/geometry/NPlane';
import { IElementable } from '../../../misc/IElementable';
import IDisplayNode from '../../IDisplayNode';
import NodeBase from '../../NodeBase';

export default class ClipDisplay extends NodeBase implements IDisplayNode {
  public get displayName (): string {
    return 'Clip Dis';
  }

  public get previewable (): true {
    return true;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Mesh to display texcoords', DataTypes.MESH, AccessTypes.ITEM);
    manager.add('p', 'Clipping plane', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (_access: DataAccess): void {
  }

  display (): IElementable[] {
    const da = new DataAccessor(this.inputManager, this.outputManager);
    const count = da.getInCount();

    const elements: IElementable[] = [];
    for (let i = 0; i < count; i++) {
      da.iterate(this, i, (_, access) => {
        const mesh = access.getData(0) as NMesh;
        const plane = access.getData(1) as NPlane;

        const clipping = new NVClipping(mesh, plane);
        elements.push(clipping);
      });
    }

    return elements;
  }
}
