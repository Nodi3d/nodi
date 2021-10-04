
import { Box3, Color, Vector3, Points, PointsMaterial, BufferGeometry, BufferAttribute } from 'three';
import IDisposable from '../../core/misc/IDisposable';
import { IElementable } from '../../core/misc/IElementable';
import NodeBase from '../../core/nodes/NodeBase';

export default class NVPoints extends Points implements IElementable {
  node: string;
  private _listener?: IDisposable;

  constructor (points: Vector3[], color: number = 0xFF0000) {
    const geom = new BufferGeometry();
    const material = new PointsMaterial({
      size: 5,
      color
    });
    const position = new Vector3();
    const array: Float32Array = new Float32Array(points.length * 3);
    if (points.length > 1) {
      points.forEach((p, idx) => {
        const i = idx * 3;
        array[i] = p.x;
        array[i + 1] = p.y;
        array[i + 2] = p.z;
      });
    } else {
      array[0] = array[1] = array[2] = 0;
      position.copy(points[0]);
    }
    geom.setAttribute('position', new BufferAttribute(array, 3));

    super(geom, material);
    this.node = '';
    this.position.copy(position);
  }

  setup (node: NodeBase): void {
    this.node = node.uuid;
    this.visible = node.visible;
    this.renderOrder = node.selected ? 10000 : 0;
    this._listener?.dispose();
    this._listener = node.onStateChanged.on((e) => {
      this.visible = e.node.visible;
      this.select(e.node);
    });
    this.select(node);
  }

  select (node: NodeBase): void {
    const material = (this.material as PointsMaterial);
    material.color = new Color(node.selected ? 0x00FF00 : 0xFF0000);
    material.depthTest = !node.selected;
    this.renderOrder = node.selected ? 10000 : 0;
  }

  public expandBox3 (box: Box3): Box3 {
    this.updateMatrixWorld(false);
    if (this.geometry.boundingBox === null) { this.geometry.computeBoundingBox(); }
    return box.union(this.geometry.boundingBox as Box3);
  }

  public dispose (): void {
    this._listener?.dispose();
    this.geometry.dispose();
  }
}
