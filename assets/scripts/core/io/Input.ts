
import NodeBase from '../nodes/NodeBase';
import { AccessTypes } from '../data/AccessTypes';
import { DataTypes } from '../data/DataTypes';
import DataTree, { DataTreeJSONType } from '../data/DataTree';
import Output from './Output';
import IO, { ConnectionJSONType, IOJSONType } from './IO';

export type InputJSONType = IOJSONType & {
  default: DataTreeJSONType | undefined;
};

export default class Input extends IO {
  protected default: DataTree | undefined;
  protected optional: boolean = false;

  constructor (parent:NodeBase, name:string, comment: string, dataType: DataTypes = DataTypes.NONE, accessType: AccessTypes = AccessTypes.ITEM) {
    super(parent, name, comment, dataType, accessType);
  }

  public getData (): DataTree | undefined {
    if (this.hasSource()) {
      return this.source?.getData();
    }
    return this.default;
  }

  public hasSource (): boolean {
    return this.connections.length > 0;
  }

  public get source (): Output | undefined {
    return this.connections[0].deref() as Output;
  }

  public hasDefault (): boolean {
    return this.default !== undefined;
  }

  public getDefault (): DataTree {
    return this.default as DataTree;
  }

  public setDefault (data: DataTree): Input {
    this.default = data;
    return this;
  }

  public setOptional (flag: boolean): Input {
    this.optional = flag;
    return this;
  }

  public isOptional (): boolean {
    return this.optional;
  }

  protected onBeforeDispose (): void {
    // this.source = null;
  }

  protected getConnectionJSON (): ConnectionJSONType[] {
    return this.connections.map((con) => {
      const io = con.deref() as IO;
      const node = io.getParent();
      return {
        uuid: node.uuid,
        index: node.outputManager.getIOIndex(io)
      };
    });
  }

  public toJSON (): InputJSONType {
    const ioJSON = super.toJSON();
    return {
      ...ioJSON,
      default: this.default?.toJSON()
    };
  }

  public fromJSON (json: InputJSONType): void {
    super.fromJSON(json);

    if (this.default !== undefined && json.default !== undefined) {
      this.default.fromJSON(json.default);
    }
  }
}
