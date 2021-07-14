import { BufferGeometry, Color, LineBasicMaterial, Vector3 } from 'three';
import { LineSegments } from 'three/src/objects/LineSegments';
import NPlane from '../../core/math/geometry/NPlane';
import IDisposable from '../../core/misc/IDisposable';
import { IElementable } from '../../core/misc/IElementable';
import NodeBase from '../../core/nodes/NodeBase';

const points: Vector3[] = [];
const lt = new Vector3(-0.5, -0.5, 0);
const rt = new Vector3(0.5, -0.5, 0);
const rb = new Vector3(0.5, 0.5, 0);
const lb = new Vector3(-0.5, 0.5, 0);
points.push(lt); points.push(rt);
points.push(rt); points.push(rb);
points.push(rb); points.push(lb);
points.push(lb); points.push(lt);
points.push(lt); points.push(rb);
points.push(rt); points.push(lb);

const geometry = new BufferGeometry();
geometry.setFromPoints(points);

export default class NVPlane extends LineSegments implements IElementable {
  private _listener?: IDisposable;

  constructor (plane: NPlane) {
    const material = new LineBasicMaterial({
      color: new Color(0xFFFF00),
      toneMapped: false
    });
    super(geometry, material);

    this.node = '';
    this.position.copy(plane.origin);
    this.rotation.copy(plane.rotation());
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
