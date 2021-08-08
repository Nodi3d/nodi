import { Object3D } from 'three';
import FrepBase from '../../core/math/frep/FrepBase';
import IDisposable from '../../core/misc/IDisposable';
import { IElementable } from '../../core/misc/IElementable';
import NodeBase from '../../core/nodes/NodeBase';

export default class NVFrep extends Object3D implements IElementable {
  public get entity () {
    return this.frep;
  }

  private frep: FrepBase;
  node: string = '';
  selected: boolean = false;
  private _listener?: IDisposable;

  constructor (frep: FrepBase) {
    super();
    this.frep = frep;
  }

  setup (node: NodeBase): void {
    this.node = node.uuid;
    this.visible = node.visible;
    this.selected = node.selected;
    this._listener?.dispose();
    this._listener = node.onStateChanged.on((e) => {
      const n = e.node;
      this.visible = n.visible;
      this.selected = n.selected;
    });
  }

  public compile (p: string): string {
    return this.frep.compile(p);
  }

  select (node: NodeBase): void {
  }

  dispose (): void {
  }
}
