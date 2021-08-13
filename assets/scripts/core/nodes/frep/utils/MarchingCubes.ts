import * as wasm from '@/wasm/marching-cubes/pkg';
import { Matrix4, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NFrepTexture from '../../../math/frep/misc/NFrepTexture';
import NFrep from '../../../math/frep/NFrep';
import { NPoint } from '../../../math/geometry';
import { NFace, NMesh } from '../../../math/geometry/mesh';
import Helper from '../../../math/Helper';
import FrepNodeBase from '../FrepNodeBase';

export default class MarchingCubes extends FrepNodeBase {
  public get displayName (): string {
    return 'MC';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'FRep to mesh', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('r', 'Meshing resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([64]));
    manager.add('p', 'Padding', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Resulting mesh', DataTypes.MESH, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const frep = access.getData(0) as NFrep;
    const resolution = access.getData(1) as number;
    const padding = access.getData(2) as number;

    const texture = new NFrepTexture();
    const buffer = texture.build(frep, padding, resolution, resolution, resolution);
    const mc = wasm.MarchingCubes.new();

    mc.set_volume(buffer, resolution, resolution, resolution);
    const triangles = mc.marching_cubes(0.5);
    const mesh = new NMesh();
    const n = triangles.length;

    const inv = 1 / resolution;

    let f = 0;
    for (let i = 0; i < n; i += 9) {
      const ax = triangles[i];
      const ay = triangles[i + 1];
      const az = triangles[i + 2];
      const bx = triangles[i + 3];
      const by = triangles[i + 4];
      const bz = triangles[i + 5];
      const cx = triangles[i + 6];
      const cy = triangles[i + 7];
      const cz = triangles[i + 8];
      const a = new NPoint(ax, ay, az).multiplyScalar(inv);
      const b = new NPoint(bx, by, bz).multiplyScalar(inv);
      const c = new NPoint(cx, cy, cz).multiplyScalar(inv);
      const n = Helper.normalFrom3Points(a, b, c);
      mesh.vertices.push(a, b, c);
      mesh.normals.push(n, n, n);
      mesh.faces.push(new NFace(f, f + 1, f + 2));
      f += 3;
    }

    let { min, max } = frep.boundingBox.getMinMax();
    const pad = new Vector3(padding, padding, padding).multiplyScalar(1);
    min = min.sub(pad);
    max = max.add(pad);
    const size = max.clone().sub(min);
    const T = new Matrix4().makeTranslation(min.x, min.y, min.z);
    const S = new Matrix4().makeScale(size.x, size.y, size.z);
    const m = new Matrix4();
    m.multiply(T);
    m.multiply(S);

    mc.free();

    access.setData(0, mesh.applyMatrix(m));
  }
}
