import { NFrepFunctionFilter } from '~/src/math/frep/NFrepFunctionFilter';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepBase } from '../../../math/frep/NFrepBase';
import { CustomPayloadType } from '../../plugins/Custom';
import { FrepCustomBase } from './FrepCustomBase';

export class FrepCustomFilter extends FrepCustomBase {
  public getCustomSetting(): CustomPayloadType {
    throw new Error('Method not implemented.');
  }
  public updateCustomSetting(setting: CustomPayloadType): void {
    throw new Error('Method not implemented.');
  }

  protected _customName: string = 'FCustomFilter';
  protected _customProgram: string = `// custom distance function (.glsl) here
// variable d(float) is input distance value
return d;`;

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

    let fn = `float ${customFunctionName} (const in vec3 p) {
      ${customProgram}
    }`;
    const n = access.getInputCount();
    for (let idx = 1; idx < n; idx++) {
      const $i = access.getData(idx) as number;
      fn = fn.replace(`$i${idx - 1}`, $i.toString());
    }

    const result = new NFrepFunctionFilter(code, frep, frep.boundingBox, fn);
    access.setData(0, result);
  }

}
