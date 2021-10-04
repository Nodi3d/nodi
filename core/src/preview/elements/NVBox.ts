import { BufferGeometry, Color, LineBasicMaterial, Vector3 } from 'three';
import { LineSegments } from 'three/src/objects/LineSegments';
import { NBoundingBox } from '@/src/math/geometry/NBoundingBox';
import { IDisposable } from '@/src/misc/IDisposable';
import { IElementable } from '@/src/misc/IElementable';
import { NodeBase } from '@/src/nodes/NodeBase';

const points: Vector3[] = [
  new Vector3(-0.5, -0.5, -0.5),
  new Vector3(0.5, -0.5, -0.5),
  new Vector3(0.5, -0.5, 0.5),
  new Vector3(-0.5, -0.5, 0.5),
  new Vector3(-0.5, 0.5, -0.5),
  new Vector3(0.5, 0.5, -0.5),
  new Vector3(0.5, 0.5, 0.5),
  new Vector3(-0.5, 0.5, 0.5)
];
const vertices: Vector3[] = [
  points[0], points[1],
  points[1], points[2],
  points[2], points[3],
  points[3], points[0],
  points[0], points[4],
  points[1], points[5],
  points[2], points[6],
  points[3], points[7],
  points[4], points[5],
  points[5], points[6],
  points[6], points[7],
  points[7], points[4]
];

const geometry = new BufferGeometry();
geometry.setFromPoints(vertices);

export class NVBox extends LineSegments implements IElementable {
  node: string;
  private _listener?: IDisposable;

  constructor (box: NBoundingBox) {
    const material = new LineBasicMaterial({
      color: new Color(0xFFFF00),
      toneMapped: false
    });
    super(geometry, material);

    this.node = '';

    const plane = box.plane;
    const dx = box.dx;
    const dy = box.dy;
    const dz = box.dz;

    const tx = plane.xAxis.clone().multiplyScalar(dx.center);
    const ty = plane.yAxis.clone().multiplyScalar(dy.center);
    const tz = plane.normal.clone().multiplyScalar(dz.center);
    this.position.copy(plane.origin.clone().add(tx).add(ty).add(tz));
    this.rotation.copy(plane.rotation());
    this.scale.set(dx.size, dy.size, dz.size);
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
    const material = this.material as LineBasicMaterial;
    material.color = new Color(node.selected ? 0x00FF00 : 0xFF0000);
    material.depthTest = !node.selected;
    this.renderOrder = node.selected ? 10000 : 0;
  }

  dispose (): void {
    this.geometry.dispose();
    this._listener?.dispose();
  }
}
