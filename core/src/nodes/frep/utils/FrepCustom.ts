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
import { FrepNodeBase } from '../FrepNodeBase';

export type FrepCustomPayloadType = {
  customName: string;
  customProgram: string;
};

export type FrepCustomJSONType = NodeJSONType & Partial<FrepCustomPayloadType>;

export class FrepCustom extends FrepNodeBase {
  public get customName (): string {
    return this._customName;
  }

  public get customProgram (): string {
    return this._customProgram;
  }

  protected _customName: string = 'FCustom';
  protected _customProgram: string = `// custom distance function (.glsl) here
// variable p(vec3) is input position 
return p;`;

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

  public solve (access: DataAccess): void {
    const frep = access.getData(0) as NFrepBase;
    const { uuid, customProgram } = this;
    const customFunctionName = `fn_${uuid.split('-').join('')}`;

    const code = function (p: string): string {
      return `${customFunctionName}(${frep.compile(p)})`;
    };

    // const fn = `vec3 ${customFunctionName} (const in vec3 p) {
    const fn = `float ${customFunctionName} (const in float p) {
      ${customProgram}
    }`;
    const result = new NFrepFunctionFilter(code, frep, frep.boundingBox, fn);
    access.setData(0, result);
  }

  public getCustomSetting (): FrepCustomPayloadType {
    return {
      customName: this.customName,
      customProgram: this.customProgram
    };
  }

  public updateCustomSetting (setting: FrepCustomPayloadType): void {
    this._customName = setting.customName;
    const updateCustomProgram = this._customProgram !== setting.customProgram;
    if (updateCustomProgram) {
      this._customProgram = setting.customProgram;
    }

    this.notifyStateChanged();
    if (updateCustomProgram) {
      this.notifyValueChanged();
    }
  }

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
