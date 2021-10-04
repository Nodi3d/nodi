
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeBase } from '../../NodeBase';
import { NSurface } from '../../../math/geometry/surface/NSurface';
import { DataTree } from '../../../data/DataTree';

export class TessellateSurface extends NodeBase {
  get displayName (): string {
    return 'Tessellate';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Surface to tessellate with adaptive refinement', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('l', 'Limit of # of division a surface patch', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([4]));
    manager.add('n', 'Normal orientation of two points in a patch to be divided', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([2.5e-2]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Resulting mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const surface = access.getData(0) as NSurface;
    const maxDepth = access.getData(1) as number;
    const normTol = access.getData(2) as number;

    // adaptive surface tessellation
    const option = {
      minDivsV: 1,
      minDivsU: 1,

      // min & max depth mean # of divide in a patch
      maxDepth,
      minDepth: 0,

      // threshold to divide
      normTol,

      // if refine flag is false, division is not executed
      refine: true
    };

    const mesh = surface.tessellate(option);
    access.setData(0, mesh);
  }
}
