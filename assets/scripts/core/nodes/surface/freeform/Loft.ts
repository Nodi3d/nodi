
import verb from '../../../lib/verb/verb';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import NSurface from '../../../math/geometry/surface/NSurface';
import NCurve from '../../../math/geometry/curve/NCurve';
import DataTree from '../../../data/DataTree';

export default class Loft extends NodeBase {
  get displayName (): string {
    return 'Loft';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Section curves', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('d', 'Section degree', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([3]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Resulting loft surface', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const curves = access.getDataList(0) as NCurve[];
    const degree = access.getData(1) as number;

    const length = curves.length;
    if (length <= 1) {
      throw new Error(`Input curves are not enough. # of curves is ${length}.`);
    }

    const profiles = curves.map((curve) => {
      return curve.toNurbsCurve();
    });

    const data = verb.geom.NurbsSurface.byLoftingCurves(profiles.map(profile => profile.verb), degree);
    access.setData(0, new NSurface(data));
  }
}
