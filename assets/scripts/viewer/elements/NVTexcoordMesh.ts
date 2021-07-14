import { BufferGeometry, DoubleSide, Mesh, RawShaderMaterial } from 'three';
import NodeBase from '../../core/nodes/NodeBase';

import TexcoordVert from '../shaders/mesh/Texcoord.vert';
import TexcoordFrag from '../shaders/mesh/Texcoord.frag';
import { IElementable } from '../../core/misc/IElementable';
import IDisposable from '../../core/misc/IDisposable';

export default class NVTexcoordMesh extends Mesh implements IElementable {
  public node: string;
  private _listener?: IDisposable;

  constructor (geometry: BufferGeometry) {
    super(geometry, new RawShaderMaterial({
      vertexShader: TexcoordVert,
      fragmentShader: TexcoordFrag,
      side: DoubleSide,
      depthWrite: true,
      depthTest: true
    }));
    this.node = '';
  }

  public setup (node: NodeBase): void {
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

  public select (node: NodeBase): void {
    this.renderOrder = node.selected ? 10000 : 0;
  }

  public dispose (): void {
    this._listener?.dispose();
  }
}
