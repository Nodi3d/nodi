import { AccessTypes } from '../data/AccessTypes';
import { DataTypes } from '../data/DataTypes';
import NodeBase from '../nodes/NodeBase';
import Input, { InputJSONType } from './Input';
import IOManager from './IOManager';
import Output from './Output';

export default class InputManager extends IOManager {
  public add (name: string, comment: string, dataType: DataTypes, accessType: AccessTypes): Input {
    const input = new Input(this.getParent(), name, comment, dataType, accessType);
    this.addIO(input);
    return input;
  }

  public remove (index: number): void {
    const count = this.getIOCount();
    if (count <= index) { throw new Error(`IO count is less than ${index}`); }

    const io = this.getIO(index);
    this.removeIO(io);
  }

  public get inputs (): Input[] {
    return this.getIOs() as Input[];
  }

  public getInput (index: number): Input {
    return this.getIO(index) as Input;
  }

  public isConnected (source: Output): boolean {
    return this.inputs.some(i => i.isConnected(source));
  }

  public disconnectSources (input: Input): void {
    const dstI = this.getIOIndex(input);
    if (dstI < 0) { throw new Error(`InputManager does not contain ${input}`); }

    const connections = input.getConnections();
    for (let j = connections.length - 1; j >= 0; j--) {
      const con = connections[j];
      const srcN = con.getParent() as NodeBase;
      const srcO = srcN.outputManager.getIOIndex(con);
      srcN.disconnectIO(srcO, this.getParent(), dstI);
    }
  }

  public connectSource (input: Input, srcN: NodeBase, source: Output): void {
    input.connect(source);
    this.onConnectIO.emit({ io: input });
  }

  public toJSON (): InputJSONType[] {
    return this.inputs.map(io => io.toJSON());
  }
}
