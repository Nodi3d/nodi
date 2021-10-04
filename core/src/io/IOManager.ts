import { AccessTypes } from '../data/AccessTypes';
import { DataTypes } from '../data/DataTypes';
import { IOEvent } from '../misc/Events';
import { IDisposable } from '../misc/IDisposable';
import { ISerializable } from '../misc/ISerializable';
import { NodeBase } from '../nodes/NodeBase';
import { IOJSONType, IO } from './IO';

export abstract class IOManager implements ISerializable, IDisposable {
  private parent: WeakRef<NodeBase>;
  private IOs: IO[] = [];
  public onAddIO: IOEvent = new IOEvent();
  public onRemoveIO: IOEvent = new IOEvent();
  public onConnectIO: IOEvent = new IOEvent();

  constructor (parent: NodeBase) {
    this.parent = new WeakRef(parent);
  }

  protected getParent (): NodeBase {
    return this.parent.deref() as NodeBase;
  }

  public addIO (io: IO) {
    this.IOs.push(io);
    this.onAddIO.emit({ io });
  }

  public removeIO (io: IO) {
    const index = this.IOs.indexOf(io);
    if (index >= 0) {
      this.IOs.splice(index, 1);
      this.onRemoveIO.emit({ io });
      io.dispose();
    }
  }

  public getIOCount (): number {
    return this.IOs.length;
  }

  protected getIOs (): IO[] {
    return this.IOs;
  }

  public getIO (index: number): IO {
    if (index >= this.IOs.length) { throw new Error(`${index} is out of IOs bounds`); }
    return this.IOs[index];
  }

  public getIOIndex (io: IO): number {
    const idx = this.IOs.indexOf(io);
    if (idx < 0) { throw new Error(`${this} doesn't have ${io}`); }
    return idx;
  }

  public hasIO (io: IO): boolean {
    return this.IOs.includes(io);
  }

  public toJSON (): IOJSONType[] {
    return this.IOs.map(io => io.toJSON());
  }

  fromJSON (jsons: IOJSONType[]): void {
    this.IOs.forEach((io, index) => {
      if (index < jsons.length) {
        io.fromJSON(jsons[index]);
      }
    });
  }

  dispose (): void {
    this.onAddIO.dispose();
    this.onRemoveIO.dispose();
    this.onConnectIO.dispose();
    this.IOs.forEach(io => io.dispose());
  }
}
