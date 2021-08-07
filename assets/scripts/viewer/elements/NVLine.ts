
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { Box3, Color, Vector2, Vector3 } from 'three';
import NodeBase from '../../core/nodes/NodeBase';
import IResolutionResponsible from '../misc/IResolutionResponsible';
import { IElementable } from '../../core/misc/IElementable';
import IDisposable from '../../core/misc/IDisposable';

export default class NVLine extends Line2 implements IElementable, IResolutionResponsible {
  node: string;
  private _listener?: IDisposable;

  constructor (points: Vector3[], color: number = 0xFF0000) {
    const geom = new LineGeometry();

    if (points.length > 0) {
      const positions: number[] = [];
      points.forEach((el) => {
        positions.push(el.x, el.y, el.z);
      });
      geom.setPositions(positions);
    }

    const material = new LineMaterial({
      color,
      linewidth: 1.5,
      resolution: new Vector2(1024, 768)
    });
    super(geom, material);
    this.node = '';
  }

  setup (node: NodeBase): void {
    this.node = node.uuid;
    this.visible = node.visible;
    this._listener = node.onStateChanged.on((e) => {
      const n = e.node;
      this.visible = n.visible;
      this.select(n);
    });
    this.select(node);
  }

  select (node: NodeBase): void {
    const material = (this.material as LineMaterial);
    material.color = new Color(node.selected ? 0x00FF00 : 0xFF0000);
    material.depthTest = !node.selected;
    this.renderOrder = node.selected ? 10000 : 0;
  }

  public setResolution (w: number, h: number) {
    this.material.uniforms.resolution.value.x = w;
    this.material.uniforms.resolution.value.y = h;
  }

  public expandBox3 (box: Box3): Box3 {
    this.updateMatrixWorld(false);
    return box.union(this.geometry.boundingBox as Box3);
  }

  public dispose (): void {
    this.geometry.dispose();
    this.material.dispose();
    this._listener?.dispose();
  }
}
