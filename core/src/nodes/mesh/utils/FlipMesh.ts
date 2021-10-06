
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NodeBase } from '../../NodeBase';

export class FlipMesh extends NodeBase {
  get displayName (): string {
    return 'MFlip';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Mesh to flip', DataTypes.MESH, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Flipped mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const mesh = access.getData(0) as NMesh;
    access.setData(0, mesh.flip());
  }
}
