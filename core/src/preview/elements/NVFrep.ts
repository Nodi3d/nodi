import { Object3D } from 'three';
import { NFrepBase } from '@/src/math/frep/NFrepBase';
import { IDisposable } from '@/src/misc/IDisposable';
import { IElementable } from '@/src/misc/IElementable';
import { NodeBase } from '@/src/nodes/NodeBase';

export class NVFrep extends Object3D implements IElementable {
  public get entity () {
    return this.frep;
  }

  private frep: NFrepBase;
  node: string = '';
  selected: boolean = false;
  private _listener?: IDisposable;

  constructor (frep: NFrepBase) {
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
