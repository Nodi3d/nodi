import { NFrepFunctionShape } from '~/src/math/frep/NFrepFunctionShape';
import { NBoundingBox } from '~/src/math/geometry/NBoundingBox';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { CustomPayloadType } from '../../plugins/Custom';
import { FrepCustomBase } from './FrepCustomBase';

const defaultInputCount = 1;

export class FrepCustomDistanceFunction extends FrepCustomBase {
  protected _customName: string = "FCustomDF";
  protected _customProgram: string = `// custom distance function (.glsl) here
// variable p(vec3) is input position value
// variable $i0(float) is input number value from node
return length(p) - $i0;`;

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Bounding box for resulting frep', DataTypes.BOX, AccessTypes.ITEM);
    manager.add('$i0', '$i0', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep custom result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const bb = access.getData(0) as NBoundingBox;

    const { uuid, customProgram } = this;
    const customFunctionName = `fn_${uuid.split('-').join('')}`;

    const code = function (p: string): string {
      return `${customFunctionName}(${p})`;
    };

    let fn = `float ${customFunctionName} (const in vec3 p) {
      ${customProgram}
    }`;

    const n = access.getInputCount();
    for (let idx = defaultInputCount; idx < n; idx++) {
      const placeHolder = `$i${idx - defaultInputCount}`;
      const $i = access.getData(idx) as number;
      const v = $i.toPrecision(8);
      fn = fn.replaceAll(placeHolder, v.toString());
    }

    const result = new NFrepFunctionShape(code, bb, fn);
    access.setData(0, result);
  }

  public getCustomSetting (): CustomPayloadType {
    const n = this.inputManager.getIOCount() - defaultInputCount;
    const arr = [...Array(n)];
    const inputs = arr.map((_, i) => {
      return this.inputManager.getInput(i + defaultInputCount);
    });
    const inAccessTypes = inputs.map(io => io.getAccessType());
    const inDataTypes = inputs.map(io => io.getDataType());

    return {
      customName: this.customName,
      inDataTypes,
      inAccessTypes,
      outDataTypes: [],
      outAccessTypes: [],
      customProgram: this.customProgram
    };
  }

  public updateCustomSetting(setting: CustomPayloadType): void {
    let updateRequired = false;

    this._customName = setting.customName;
    const current = this.getCustomSetting();
    if (
      // check equality of inputs & outputs
      current.inDataTypes.length !== setting.inDataTypes.length ||
      current.inDataTypes.some((d, i) => setting.inDataTypes[i] !== d) ||
      current.inAccessTypes.some((d, i) => setting.inAccessTypes[i] !== d)
    ) {
      // clear IOs
      this.disconnectAllIO();
      for (let i = this.inputManager.getIOCount() - 1; i >= defaultInputCount; i--) {
        const io = this.inputManager.getIO(i);
        this.inputManager.removeIO(io);
      }

      // rebuild IOs
      setting.inDataTypes.forEach((dataType, index) => {
        this.inputManager.add(`$i${index - defaultInputCount}`, '', dataType, setting.inAccessTypes[index]);
      });

      updateRequired = true;
    }

    if (this._customProgram !== setting.customProgram) {
      updateRequired = true;
      this._customProgram = setting.customProgram;
    }

    this.notifyStateChanged();
    if (updateRequired) {
      this.notifyValueChanged();
    }
  }

}
