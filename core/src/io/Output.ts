
import { NodeBase } from '../nodes/NodeBase';
import { AccessType, AccessTypes } from '../data/AccessTypes';
import { DataTypes } from '../data/DataTypes';
import { DataTree } from '../data/DataTree';
import { IOEvent } from '../misc/Events';
import { ConnectionJSONType, IO } from './IO';

export class Output extends IO {
  protected data: DataTree = new DataTree();
  public onDataChanged: IOEvent = new IOEvent();

  constructor (parent:NodeBase, name: string, comment: string, dataType: DataTypes = DataTypes.NONE, accessType: AccessType = AccessTypes.ITEM) {
    super(parent, name, comment, dataType, accessType);
  }

  protected onBeforeDispose (): void {
  }

  public isEmpty (): boolean {
    return this.data.isEmpty();
  }

  public clearData (): void {
    if (this.data.isEmpty()) { return; }

    this.data.dispose();
    this.data = new DataTree();
    this.notifyDataChanged();
  }

  public getData (): DataTree | undefined {
    return this.data;
  }

  public notifyDataChanged (): void {
    this.onDataChanged.emit({ io: this });
  }

  protected getConnectionJSON (): ConnectionJSONType[] {
    return this.connections.map((con) => {
      const io = con.deref() as IO;
      const node = io.getParent();
      return {
        uuid: node.uuid,
        index: node.inputManager.getIOIndex(io)
      };
    });
  }
}
