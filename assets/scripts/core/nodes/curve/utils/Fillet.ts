
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NCurve from '../../../math/geometry/curve/NCurve';
import NLineCurve from '../../../math/geometry/curve/NLineCurve';
import NPolylineCurve from '../../../math/geometry/curve/NPolylineCurve';
import { concatFilletPoints, getCornerFilletPoints, getFilletedPoints } from '../../../math/geometry/FilletCurveHelper';
import NPoint from '../../../math/geometry/NPoint';
import Helper from '../../../math/Helper';
import NodeBase from '../../NodeBase';

export default class FilletAtParameter extends NodeBase {
  get displayName (): string {
    return 'Fillet';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Polyline Curve to fillet', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('r', 'Radius to fillet', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('r', 'Polyline resolution for filleted corners', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([32]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('c', 'Curve with filleted corners', DataTypes.CURVE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curve = access.getData(0) as NCurve;
    const radius = access.getData(1) as number;
    const resolution = access.getData(2) as number;

    if (!(curve instanceof NPolylineCurve)) {
      throw new TypeError('Fillet only accepts Polyline Curve');
    }

    const result = this.applyFillet(curve, radius, resolution);
    access.setData(0, result);
  }

  private applyFillet (curve: NPolylineCurve, radius: number, resolution: number): NPolylineCurve {
    // Filletの終点同士が衝突しないところでradiusを打ち切る
    const points = getFilletedPoints(curve, radius, resolution);
    return new NPolylineCurve(points, curve.closed);
  }
}
