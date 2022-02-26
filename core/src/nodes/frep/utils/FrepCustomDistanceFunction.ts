import { Vector3 } from 'three';
import { NFrepFunctionFilter } from '~/src/math/frep/NFrepFunctionFilter';
import { NFrepFunctionShape } from '~/src/math/frep/NFrepFunctionShape';
import { NFrepShape } from '~/src/math/frep/NFrepShape';
import { NBoundingBox } from '~/src/math/geometry/NBoundingBox';
import { NPlane } from '~/src/math/geometry/NPlane';
import { NDomain } from '~/src/math/primitive/NDomain';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { CustomPayloadType } from '../../plugins/Custom';
import { FrepCustomBase } from './FrepCustomBase';

const defaultInputCount = 2;

export class FrepCustomDistanceFunction extends FrepCustomBase {
  protected _customName: string = "FCustomDF";
  protected _customProgram: string = `// custom distance function (.glsl) here
// variable p(vec3) is input position value
// variable $i0(float) is input number value from node
return abs(p) - $i0;`;

  public registerInputs (manager: InputManager): void {
    manager.add('p', 'Plane for bounding box', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('s', 'Size for bounding box', DataTypes.VECTOR, AccessTypes.ITEM).setDefault(new DataTree().add([new Vector3(1, 1, 1)]));
    manager.add('$i0', '$i0', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('R', 'Frep custom result', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const size = access.getData(1) as Vector3;

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

    const bb = new NBoundingBox(
      plane,
      new NDomain(-size.x * 0.5, size.x * 0.5),
      new NDomain(-size.y * 0.5, size.y * 0.5),
      new NDomain(-size.z * 0.5, size.z * 0.5)
    );
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
