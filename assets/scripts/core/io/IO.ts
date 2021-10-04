
import { AccessTypes } from '../data/AccessTypes';
import DataTree from '../data/DataTree';
import { DataTypes } from '../data/DataTypes';
import { IOEvent } from '../misc/Events';
import ISerializable from '../misc/ISerializable';
import NodeBase from '../nodes/NodeBase';

export type ConnectionJSONType = {
  uuid: string;
  index: number;
};

export type IOJSONType = {
  name?: string;
  comment?: string;
  dataType: DataTypes;
  accessType?: AccessTypes;
  connections: ConnectionJSONType[];
  displayType?: IODisplayType;
};

export const IODisplayTypes = {
  Default: 'Default',
  Hidden: 'Hidden'
} as const;
export type IODisplayType = typeof IODisplayTypes[keyof typeof IODisplayTypes];

export default abstract class IO implements ISerializable {
  public getParent (): NodeBase {
    return this.parent.deref() as NodeBase;
  }

  public abstract getData(): DataTree | undefined;

  public getAccessType (): AccessTypes {
    return this.accessType;
  }

  public setAccessType (type: AccessTypes): void {
    this.accessType = type;
  }

  public get displayType (): IODisplayType {
    return this._displayType;
  }

  parent: WeakRef<NodeBase>;
  selected: boolean = false;
  protected name: string;
  protected description: string;
  protected dataType: DataTypes;
  protected accessType: AccessTypes = AccessTypes.ITEM;
  protected connections: WeakRef<IO>[] = [];
  protected _displayType: IODisplayType = IODisplayTypes.Default;

  public onStateChanged: IOEvent = new IOEvent();

  constructor (parent: NodeBase, name: string, description: string, dataType: DataTypes = DataTypes.NONE, accessType: AccessTypes = AccessTypes.ITEM) {
    this.parent = new WeakRef(parent);
    this.name = name;
    this.description = description;
    this.dataType = dataType;
    this.accessType = accessType;
  }

  public getDataType (): DataTypes {
    return this.dataType;
  }

  public getName (): string {
    return this.name;
  }

  public setName (name: string) {
    this.name = name;
    return this;
  }

  public getDescription (): string {
    return this.description;
  }

  public setDescription (description: string) {
    this.description = description;
    return this;
  }

  public match (io: IO) {
    return (io.dataType & this.dataType) !== 0;
  }

  public select (): void {
    this.selected = true;
    this.notifyStateChanged();
  }

  public unselect (): void {
    this.selected = false;
    this.notifyStateChanged();
  }

  public hasConnection (): boolean {
    return this.connections.length > 0;
  }

  public getConnections (): IO[] {
    return this.connections.map(c => c.deref() as IO);
  }

  public getConnectionCount (): number {
    return this.connections.length;
  }

  public getConnectedNodes (): NodeBase[] {
    return this.connections.map(io => (io.deref() as IO).getParent());
  }

  public isConnected (other: IO): boolean {
    // return this.connections.includes(other);
    return this.connections.some(con => con.deref() === other);
  }

  public connect (io: IO): void {
    this.connections.push(new WeakRef(io));
  }

  public disconnect (io: IO): void {
    const idx = this.connections.findIndex(con => (con.deref() === io));
    if (idx >= 0) {
      this.connections.splice(idx, 1);
    } else {
      throw new Error(`${io} is not connected.`);
    }
  }

  public highlight (valid: boolean) {
  }

  public unhighlight () {
  }

  public setDisplayType (type: IODisplayType): void {
    this._displayType = type;
    this.notifyStateChanged();
  }

  protected notifyStateChanged () {
    this.onStateChanged.emit({ io: this });
  }

  public dispose (): void {
    this.onBeforeDispose();
    this.onStateChanged.dispose();
  }

  protected abstract onBeforeDispose(): void;

  protected abstract getConnectionJSON(): ConnectionJSONType[];

  public toJSON (): IOJSONType {
    return {
      name: this.name,
      comment: this.description,
      dataType: this.dataType,
      accessType: this.accessType,
      connections: this.getConnectionJSON(),
      displayType: this.displayType
    };
  }

  public fromJSON (json: IOJSONType): void {
    this.name = json.name ?? this.name;
    this.description = json.comment ?? this.description;
    this.dataType = json.dataType;
    this.accessType = json.accessType ?? this.accessType;
    this._displayType = json.displayType ?? IODisplayTypes.Default;
  }
}
