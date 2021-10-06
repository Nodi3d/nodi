import { ArrowHelper } from 'three';
import { IDisposable } from '@/src/misc/IDisposable';
import { IElementable } from '@/src/misc/IElementable';
import { NodeBase } from '@/src/nodes/NodeBase';

export class NVArrow extends ArrowHelper implements IElementable {
  node: string = '';
  private _listener?: IDisposable;

  setup (node: NodeBase): void {
    this.node = node.uuid;
    this.visible = node.visible;
    this._listener?.dispose();
    this._listener = node.onStateChanged.on((e) => {
      const n = e.node;
      this.visible = n.visible;
      this.select(n);
    });
    this.select(node);
  }

  select (node: NodeBase): void {
    this.renderOrder = node.selected ? 10000 : 0;
  }

  dispose (): void {
    this._listener?.dispose();
  }
}
