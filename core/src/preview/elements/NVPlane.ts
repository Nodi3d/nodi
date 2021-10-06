import { BufferGeometry, Color, LineBasicMaterial } from 'three';
import { LineSegments } from 'three/src/objects/LineSegments';
import { NPlane } from '@/src/math/geometry/NPlane';
import { IDisposable } from '@/src/misc/IDisposable';
import { IElementable } from '@/src/misc/IElementable';
import { NodeBase } from '@/src/nodes/NodeBase';

export class NVPlane extends LineSegments implements IElementable {
  private _listener?: IDisposable;

  constructor (plane: NPlane) {
    const material = new LineBasicMaterial({
      color: new Color(0xFFFF00),
      toneMapped: false
    });

    const dx0 = plane.xAxis.clone().multiplyScalar(-0.5);
    const dx1 = plane.xAxis.clone().multiplyScalar(0.5);
    const dy0 = plane.yAxis.clone().multiplyScalar(-0.5);
    const dy1 = plane.yAxis.clone().multiplyScalar(0.5);
    const lt = dx0.clone().add(dy0);
    const rt = dx1.clone().add(dy0);
    const rb = dx1.clone().add(dy1);
    const lb = dx0.clone().add(dy1);
    const geometry = new BufferGeometry();
    geometry.setFromPoints([
      lt, rt, rt, rb,
      rb, lb, lb, lt,
      lt, rb, rt, lb
    ]);

    super(geometry, material);

    this.node = '';
    this.position.copy(plane.origin);
  }

  node: string;
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
    const material = this.material as LineBasicMaterial;
    material.color = new Color(node.selected ? 0x00FF00 : 0xFF0000);
    material.depthTest = !node.selected;
    this.renderOrder = node.selected ? 10000 : 0;
  }

  dispose (): void {
    this._listener?.dispose();
  }
}
