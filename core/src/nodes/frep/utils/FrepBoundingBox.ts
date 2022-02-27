import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepBase } from '../../../math/frep/NFrepBase';
import { NFrepFilter } from '../../../math/frep/NFrepFilter';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NDomain } from '../../../math/primitive/NDomain';
import { FrepNodeBase } from '../FrepNodeBase';

export class FrepBoundingBox extends FrepNodeBase {
  public get displayName (): string {
    return 'FBBox';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Base frep', DataTypes.FREP, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('b', 'Frep bounding box', DataTypes.BOX, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const frep = access.getData(0) as NFrepBase;
    access.setData(0, frep.boundingBox.clone());
  }
}
