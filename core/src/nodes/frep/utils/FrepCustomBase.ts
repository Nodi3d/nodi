import { NFrepFunctionFilter } from '~/src/math/frep/NFrepFunctionFilter';
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
import { NodeJSONType } from '../../NodeBase';
import { CustomPayloadType } from '../../plugins/Custom';
import { FrepNodeBase } from '../FrepNodeBase';

export type FrepCustomJSONType = NodeJSONType & Partial<CustomPayloadType>;

export abstract class FrepCustomBase extends FrepNodeBase {
  public get customName (): string {
    return this._customName;
  }

  public get customProgram (): string {
    return this._customProgram;
  }

  protected abstract _customName: string;
  protected abstract _customProgram: string;

  public get displayName (): string {
    return this._customName;
  }

  public setupViewElement (container: HTMLDivElement): void {
    const span = document.createElement('span');

    this.onStateChanged.on(() => {
      span.textContent = this.displayName;
    });

    span.textContent = this.displayName;
    container.appendChild(span);
  }

  public registerInputs (manager: InputManager): void {
    manager.add('f', 'Base frep', DataTypes.FREP, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep custom result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public abstract getCustomSetting (): CustomPayloadType;

  public abstract updateCustomSetting (setting: CustomPayloadType): void;

  toJSON (name: string): FrepCustomJSONType {
    const setting = this.getCustomSetting();
    return {
      ...super.toJSON(name),
      ...setting
    };
  }

  fromJSON (json: FrepCustomJSONType): void {
    const current = this.getCustomSetting();
    current.customName = json.customName ?? current.customName;
    current.customProgram = json.customProgram ?? current.customProgram;
    this.updateCustomSetting(current);
    super.fromJSON(json);
  }

}
