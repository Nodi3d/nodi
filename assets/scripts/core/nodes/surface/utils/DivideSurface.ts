
import { Vector2, Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import NSurface from '../../../math/geometry/surface/NSurface';
import NPoint from '../../../math/geometry/NPoint';

export default class DivideSurface extends NodeBase {
  get displayName (): string {
    return 'Divide Surface';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Surface to divide', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('u', 'Number of segments in {u} direction', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('v', 'Number of segments in {v} direction', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Division points', DataTypes.POINT, AccessTypes.LIST);
    manager.add('v', 'Normal vectors at division points', DataTypes.VECTOR, AccessTypes.LIST);
    manager.add('p', 'Parameter coordinates at division points', DataTypes.VECTOR, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const surface = access.getData(0) as NSurface;
    const u = access.getData(1) as number;
    const v = access.getData(2) as number;

    const points: NPoint[][] = [];
    const normals: Vector3[][] = [];
    const uv: Vector2[][] = [];

    const invU = 1.0 / u;
    const invV = 1.0 / v;
    for (let iv = 0; iv <= v; iv++) {
      const y = iv * invV;

      const cpoints: NPoint[] = [];
      const cnormals: Vector3[] = [];
      const cuv: Vector2[] = [];

      for (let iu = 0; iu <= u; iu++) {
        const x = iu * invU;
        cpoints.push(NPoint.fromVector(surface.point(x, y)));
        cnormals.push(surface.normal(x, y));
        cuv.push(new Vector2(x, y));
      }

      points.push(cpoints);
      normals.push(cnormals);
      uv.push(cuv);
    }

    access.setDataList(0, points);
    access.setDataList(1, normals);
    access.setDataList(2, uv);
  }
}
