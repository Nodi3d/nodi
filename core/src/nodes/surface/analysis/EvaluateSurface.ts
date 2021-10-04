
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NPlane } from '../../../math/geometry/NPlane';
import { NPoint } from '../../../math/geometry/NPoint';
import { NSurface } from '../../../math/geometry/surface/NSurface';
import { NodeBase } from '../../NodeBase';

export class EvaluateSurface extends NodeBase {
  get displayName (): string {
    return 'Evaluate Surface';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Surface to evaluate', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('c', '{uv} coordinate to evaluate', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(0.5, 0.5)]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Point at {uv}', DataTypes.POINT, AccessTypes.ITEM);
    manager.add('v', 'Normal vector at {uv}', DataTypes.VECTOR, AccessTypes.ITEM);
    manager.add('p', 'Frame at {uv}', DataTypes.PLANE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const surface = access.getData(0) as NSurface;
    const uv = access.getData(1) as Vector3;

    const point = NPoint.fromVector(surface.point(uv.x, uv.y));
    const derivs = surface.derivatives(uv.x, uv.y, 1);

    const v0 = derivs[1][0];
    const v1 = derivs[0][1];
    const dx = v0.normalize();
    const dy = v1.normalize();
    const normal = (new Vector3()).crossVectors(dx, dy);

    access.setData(0, point);
    access.setData(1, normal);
    access.setData(2, new NPlane(point, dx, dy, normal));
  }
}
