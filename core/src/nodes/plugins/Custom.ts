import { AccessTypes } from '../../data/AccessTypes';
import { DataAccess } from '../../data/DataAccess';
import { DataTypes, GeometryDataTypes } from '../../data/DataTypes';
import { InputManager } from '../../io/InputManager';
import { OutputManager } from '../../io/OutputManager';
import { NodeJSONType, NodeBase } from '../NodeBase';

import { NComplexNumber } from '~/src/math/primitive/NComplexNumber';
import { NDomain } from '~/src/math/primitive/NDomain';
import { NGroup } from '~/src/math/primitive/NGroup';
import { NBoundingBox } from '~/src/math/geometry/NBoundingBox';
import { NPlane } from '~/src/math/geometry/NPlane';
import { NPoint } from '~/src/math/geometry/NPoint';
import { NArcCurve } from '~/src/math/geometry/curve/NArcCurve';
import { NCircleCurve } from '~/src/math/geometry/curve/NCircleCurve';
import { NEllipseArcCurve } from '~/src/math/geometry/curve/NEllipseArcCurve';
import { NEllipseCurve } from '~/src/math/geometry/curve/NEllipseCurve';
import { NLineCurve } from '~/src/math/geometry/curve/NLineCurve';
import { NNurbsCurve } from '~/src/math/geometry/curve/NNurbsCurve';
import { NPolylineCurve } from '~/src/math/geometry/curve/NPolylineCurve';
import { NRectangleCurve } from '~/src/math/geometry/curve/NRectangleCurve';
import { NFace } from '~/src/math/geometry/mesh/NFace';
import { NMesh } from '~/src/math/geometry/mesh/NMesh';
import { NSurface } from '~/src/math/geometry/surface/NSurface';
import { NTrimmedSurface } from '~/src/math/geometry/surface/NTrimmedSurface';

export type CustomPayloadType = {
  customName: string;
  inDataTypes: number[];
  inAccessTypes: number[];
  outDataTypes: number[];
  outAccessTypes: number[];
  customProgram: string;
};

export type CustomJSONType = NodeJSONType & Partial<CustomPayloadType>;

export class Custom extends NodeBase {
  public get customName (): string {
    return this._customName;
  }

  public get customProgram (): string {
    return this._customProgram;
  }

  private _customName: string = 'Custom';
  private _customProgram: string = `// custom code here
let i0 = access.getData(0);
let i1 = access.getData(1);
let result = i0 * i1;
access.setData(0, result);`;

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
    manager.add('$i0', '$i0', DataTypes.NUMBER, AccessTypes.ITEM);
    manager.add('$i1', '$i1', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('Output value', '$o0', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public getCustomSetting (): CustomPayloadType {
    const n = this.inputManager.getIOCount();
    const inputs = [...Array(n)].map((_, i) => {
      return this.inputManager.getInput(i);
    });
    const m = this.outputManager.getIOCount();
    const outputs = [...Array(m)].map((_, i) => {
      return this.outputManager.getOutput(i);
    });

    const inAccessTypes = inputs.map(io => io.getAccessType());
    const inDataTypes = inputs.map(io => io.getDataType());
    const outAccessTypes = outputs.map(io => io.getAccessType());
    const outDataTypes = outputs.map(io => io.getDataType());

    return {
      customName: this.customName,
      inDataTypes,
      inAccessTypes,
      outDataTypes,
      outAccessTypes,
      customProgram: this.customProgram
    };
  }

  public updateCustomSetting (setting: CustomPayloadType): void {
    const current = this.getCustomSetting();

    let updateRequired = false;

    this._customName = setting.customName;

    if (
      // check equality of inputs & outputs
      current.inDataTypes.length !== setting.inDataTypes.length ||
      current.outDataTypes.length !== setting.outDataTypes.length ||
      current.inDataTypes.some((d, i) => setting.inDataTypes[i] !== d) ||
      current.inAccessTypes.some((d, i) => setting.inAccessTypes[i] !== d) ||
      current.outDataTypes.some((d, i) => setting.outDataTypes[i] !== d) ||
      current.outAccessTypes.some((d, i) => setting.outAccessTypes[i] !== d)
    ) {
      // clear IOs
      this.disconnectAllIO();
      for (let i = this.inputManager.getIOCount() - 1; i >= 0; i--) {
        const io = this.inputManager.getIO(i);
        this.inputManager.removeIO(io);
      }
      for (let i = this.outputManager.getIOCount() - 1; i >= 0; i--) {
        const io = this.outputManager.getIO(i);
        this.outputManager.removeIO(io);
      }

      // rebuild IOs
      setting.inDataTypes.forEach((dataType, index) => {
        this.inputManager.add(`$i${index}`, '', dataType, setting.inAccessTypes[index]);
      });
      setting.outDataTypes.forEach((dataType, index) => {
        this.outputManager.add(`$i${index}`, '', dataType, setting.outAccessTypes[index]);
      });

      updateRequired = true;
    }

    if (this._customProgram !== setting.customProgram) {
      this._customProgram = setting.customProgram;
      updateRequired = true;
    }

    this._previewable = setting.outDataTypes.some(o => (o & GeometryDataTypes) !== 0);

    this.notifyStateChanged();
    if (updateRequired) {
      this.notifyValueChanged();
    }
  }

  public solve (access: DataAccess): void {
    const context: { [index: string]: any } = {
      NComplexNumber,
      NDomain,
      NGroup,
      NBoundingBox,
      NPlane,
      NPoint,
      NArcCurve,
      NCircleCurve,
      NEllipseArcCurve,
      NEllipseCurve,
      NLineCurve,
      NNurbsCurve,
      NPolylineCurve,
      NRectangleCurve,
      NFace,
      NMesh,
      NSurface,
      NTrimmedSurface,
      access
    };

    // eslint-disable-next-line no-new-func
    const f = new Function(...Object.keys(context), this.customProgram);
    f(...Object.values(context));
  }

  toJSON (): CustomJSONType {
    const setting = this.getCustomSetting();
    return {
      ...super.toJSON(),
      ...setting
    };
  }

  fromJSON (json: CustomJSONType): void {
    const current = this.getCustomSetting();
    current.customName = json.customName ?? current.customName;
    current.customProgram = json.customProgram ?? current.customProgram;
    current.inDataTypes = json.inDataTypes ?? current.inDataTypes;
    current.inAccessTypes = json.inAccessTypes ?? current.inAccessTypes;
    current.outDataTypes = json.outDataTypes ?? current.outDataTypes;
    current.outAccessTypes = json.outAccessTypes ?? current.outAccessTypes;
    this.updateCustomSetting(current);
    super.fromJSON(json);
  }
}
