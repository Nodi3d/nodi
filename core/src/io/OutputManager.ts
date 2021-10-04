import { AccessTypes, AccessType } from '../data/AccessTypes';
import { DataTypes } from '../data/DataTypes';
import { NodeBase } from '../nodes/NodeBase';
import { Input } from './Input';
import { IOManager } from './IOManager';
import { Output } from './Output';

export class OutputManager extends IOManager {
  public add (name: string, comment: string, dataType: DataTypes, accessType: AccessType): Output {
    const output = new Output(this.getParent(), name, comment, dataType, accessType);
    this.addIO(output);
    return output;
  }

  public get outputs (): Output[] {
    return this.getIOs() as Output[];
  }

  public getOutput (index: number): Output {
    return this.getIO(index) as Output;
  }

  public isConnected (destination: Input): boolean {
    return this.outputs.some(o => o.isConnected(destination));
  }

  public connectDestination (output: Output, dstN: NodeBase, dstI: Input): void {
    output.connect(dstI);
    this.onConnectIO.emit({ io: output });
  }

  public disconnectDestinations (output: Output) {
    const srcO = this.getIOIndex(output);
    if (srcO < 0) { throw new Error(`OutputManager does not contain ${output}`); }

    const connections = output.getConnections();
    for (let j = connections.length - 1; j >= 0; j--) {
      const con = connections[j];
      const dstN = con.getParent() as NodeBase;
      const dstI = dstN.inputManager.getIOIndex(con);
      this.getParent().disconnectIO(srcO, dstN, dstI);
    }
  }

  public isEmpty (): boolean {
    return this.outputs.some(o => o.isEmpty());
  }

  public clear (): void {
    const count = this.getIOCount();
    for (let i = 0; i < count; i++) {
      const output = this.getOutput(i);
      output.clearData();
    }
  }
}
