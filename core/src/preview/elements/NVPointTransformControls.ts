
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { IDisposable } from '@/src/misc/IDisposable';
import { IElementable } from '@/src/misc/IElementable';
import { NodeBase } from '@/src/nodes/NodeBase';

export class NVPointTransformControls extends TransformControls implements IElementable {
  public get node (): string {
    return this._node;
  }

  private _node: string = '';
  private _listener?: IDisposable;

  setup (node: NodeBase): void {
    this._node = node.uuid;
    this.visible = node.visible;
    this._listener?.dispose();
    this._listener = node.onStateChanged.on((e) => {
      this.visible = e.node.visible;
      this.select(e.node);
    });
  }

  select (node: NodeBase): void {
  }

  dispose () {
    this._listener?.dispose();
    this.detach();
    super.dispose();
  }
}
