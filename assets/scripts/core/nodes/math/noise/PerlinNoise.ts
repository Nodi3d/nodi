import { Noise } from 'noisejs';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase from '../../NodeBase';

export default class PerlinNoise extends NodeBase {
  get displayName (): string {
    return 'Perlin Noise';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('x', 'X float value', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('y', 'Y float value', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('z', 'Z float value', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
    manager.add('s', 'Seed value (a float between 0.0 and 1.0 or an integer from 1 to 65536)', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Output value (-1.0 to 1.0)', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const x = access.getData(0) as number;
    const y = access.getData(1) as number;
    const z = access.getData(2) as number;
    const seed = access.getData(3) as number;

    const noise = new Noise(seed);
    access.setData(0, noise.perlin3(x, y, z));
  }
}
