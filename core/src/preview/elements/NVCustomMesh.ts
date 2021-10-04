import { BufferGeometry, Color, Material, Mesh, MeshStandardMaterial } from 'three';
import { IDisposable } from '@/src/misc/IDisposable';
import { IElementable } from '@/src/misc/IElementable';
import { CustomPreview } from '@/src/nodes/display/mesh/CustomPreview';
import { NodeBase } from '@/src/nodes/NodeBase';

export class NVCustomMesh extends Mesh implements IElementable {
  node: string;
  private _listener?: IDisposable;

  constructor (geometry: BufferGeometry, material: Material) {
    super(geometry, material);
    this.node = '';
  }

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

    const preview = (node as CustomPreview);
    const m = this.material as MeshStandardMaterial;
    m.color = new Color(preview.color);
    m.emissive = new Color(preview.emission);
    m.roughness = preview.roughness;
    m.metalness = preview.metalness;
  }

  dispose (): void {
    this._listener?.dispose();
  }
}
