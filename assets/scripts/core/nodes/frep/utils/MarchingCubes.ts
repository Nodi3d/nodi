import { Matrix4, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFrepTexture, { FrepRenderProps } from '../../../math/frep/misc/NFrepTexture';
import NFrep from '../../../math/frep/NFrep';
import { NPoint } from '../../../math/geometry';
import { NFace, NMesh } from '../../../math/geometry/mesh';
import Helper from '../../../math/Helper';

import AsyncNodeBase from '../../AsyncNodeBase';
// import MarchingCubesWorker from 'worker-loader!~/assets/scripts/core/workers/MarchingCubes.worker';
import MarchingCubesWorker, { MarchingCubesProps } from '../../../workers/MarchingCubes.worker';
import NFrepMarchingCubes from '../../../math/frep/misc/NFrepMarchingCubes';

type MCResult = {
  triangles: Float32Array;
  min: Vector3;
  max: Vector3;
};

export default class MarchingCubes extends AsyncNodeBase {
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
    const mesh = await mc.execute(frep, resolution, padding);
    access.setData(0, mesh);
  }
}
