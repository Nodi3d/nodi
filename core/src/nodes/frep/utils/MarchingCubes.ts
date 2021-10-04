import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrep } from '../../../math/frep/NFrep';

import { AsyncNodeBase } from '../../AsyncNodeBase';
import { NFrepMarchingCubes } from '../../../math/frep/misc/NFrepMarchingCubes';

export class MarchingCubes extends AsyncNodeBase {
  public get displayName (): string {
    return 'MC';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'FRep to mesh', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('r', 'Meshing resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([64]));
    manager.add('p', 'Meshing padding', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Resulting mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public async solve (access: DataAccess) {
    const frep = access.getData(0) as NFrep;
    const resolution = access.getData(1) as number;
    const padding = access.getData(2) as number;

    const mc = new NFrepMarchingCubes();
    const { result, dw } = await mc.execute(frep, resolution, padding);
    const mesh = mc.build(result, dw, resolution);
    access.setData(0, mesh);
  }
}
