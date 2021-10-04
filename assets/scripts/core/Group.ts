
import { v4 } from 'uuid';
import Selectable from '../editor/ISelectable';
import { GroupEvent } from './misc/Events';
import ElementBase from './ElementBase';
import IDisposable from './misc/IDisposable';

export type GroupJSONType = {
  uuid: string,
  nodes: string[],
};

export default class Group extends ElementBase implements Selectable, IDisposable {
  public uuid: string;
  protected nodes: string[];

  public onStateChanged: GroupEvent = new GroupEvent();
  private selected: boolean = false;

  constructor (uuid: string, nodes: string[]) {
    super(uuid);

    this.uuid = uuid;
    this.nodes = nodes.slice();
  }

  public select (): void {
    this.selected = true;
    this.onStateChanged.emit({ group: this });
  }

  public unselect (): void {
    this.selected = false;
    this.onStateChanged.emit({ group: this });
  }

  public isEmpty (): boolean {
    return this.nodes.length <= 0;
  }

  public toJSON (): GroupJSONType {
    return {
      uuid: this.uuid,
      nodes: this.nodes
    };
  }

  public getNodes (): string[] {
    return this.nodes;
  }

  public hasNode (node: string): boolean {
    return this.nodes.includes(node);
  }

  public addNodes (nodes: string[]): void {
    nodes.forEach((uuid) => {
      if (!this.nodes.includes(uuid)) {
        this.nodes.push(uuid);
      }
    });
    this.onStateChanged.emit({ group: this });
  }

  public removeNode (uuid: string): void {
    const idx = this.nodes.indexOf(uuid);
    if (idx >= 0) {
      this.nodes.splice(idx, 1);
    }
    this.onStateChanged.emit({ group: this });
  }

  public removeNodes (nodes: string[]): void {
    nodes.forEach((uuid) => {
      this.removeNode(uuid);
    });
    this.onStateChanged.emit({ group: this });
  }

  public dispose (): void {
  }
}
