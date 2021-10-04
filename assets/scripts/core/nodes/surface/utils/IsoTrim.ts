
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';
import NSurface from '../../../math/geometry/surface/NSurface';
import NDomain from '../../../math/primitive/NDomain';

export default class IsoTrim extends NodeBase {
  get displayName (): string {
    return 'IsoTrim';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Surface to trim', DataTypes.SURFACE, AccessTypes.ITEM);
    manager.add('u', 'Domain in {u} direction', DataTypes.DOMAIN, AccessTypes.ITEM);
    manager.add('v', 'Domain in {v} direction', DataTypes.DOMAIN, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Resulting surface', DataTypes.SURFACE, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const surface = access.getData(0) as NSurface;
    const uDomain = access.getData(1) as NDomain;
    const vDomain = access.getData(2) as NDomain;

    let verb = surface.getVerb();

    let us = uDomain.start;
    let ue = uDomain.end;
    let vs = vDomain.start;
    let ve = vDomain.end;

    if (us > ue) {
      const tmp = us;
      us = ue;
      ue = tmp;
    }
    if (vs > ve) {
      const tmp = vs;
      vs = ve;
      ve = tmp;
    }

    const u0 = us;
    const u1 = (ue - us) / (1 - us);
    verb = verb.split(u0, false)[1];
    verb = verb.split(u1, false)[0];

    const v0 = vs;
    const v1 = (ve - vs) / (1 - vs);
    verb = verb.split(v0, true)[1];
    verb = verb.split(v1, true)[0];

    access.setData(0, new NSurface(verb));
  }
}
