
import { Box3, BufferGeometry, LineBasicMaterial, LineSegments, Vector2, Vector3 } from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';

import IResolutionResponsible from '../misc/IResolutionResponsible';
import TextLabel from './TextLabel';
const opacity = 0.85;

export default class BoundingBoxLineSegments extends LineSegments implements IResolutionResponsible {
  box: Box3;
  displaySize: Vector3;
  labels: TextLabel[];

  constructor (color: number = 0x1185DD) {
    const geom = new BufferGeometry();
    // const geom = new LineSegmentsGeometry();
    // const material = new LineMaterial({
    const material = new LineBasicMaterial({
      color,
      linewidth: 1.25,
      opacity,
      // depthWrite: false,
      transparent: true
      // resolution: new Vector2(1024, 768)
    });

    super(geom, material);
    this.renderOrder = 10000;

    this.box = new Box3();
    this.displaySize = new Vector3();
    this.labels = [];
  }

  public isEmpty (): boolean {
    return this.box.isEmpty();
  }

  public update (box: Box3): void {
    this.box = box;

    this.clearLabels();
    this.displaySize.set(0, 0, 0);

    const empty = box.isEmpty();
    const m = this.material as LineBasicMaterial;
    m.opacity = empty ? 0 : opacity;
    if (empty) {
      return;
    }

    const min = box.min;
    const max = box.max;
    const p0 = new Vector3(min.x, min.y, min.z);
    const p1 = new Vector3(max.x, min.y, min.z);
    const p2 = new Vector3(max.x, min.y, max.z);
    const p3 = new Vector3(min.x, min.y, max.z);
    const p4 = new Vector3(min.x, max.y, min.z);
    const p5 = new Vector3(max.x, max.y, min.z);
    const p6 = new Vector3(max.x, max.y, max.z);
    const p7 = new Vector3(min.x, max.y, max.z);
    const points = [
      // bottom
      p0, p1,
      p1, p2,
      p2, p3,
      p3, p0,

      // side
      p0, p4,
      p1, p5,
      p2, p6,
      p3, p7,

      // top
      p4, p5,
      p5, p6,
      p6, p7,
      p7, p4
    ];

    /*
    const positions: number[] = [];
    points.forEach((el) => {
      positions.push(el.x, el.y, el.z);
    });
    this.geometry.setPositions(positions);
    this.geometry.computeBoundingBox();
    */

    this.geometry.setFromPoints(points);
    this.computeLineDistances();

    const color = '#1182ee';

    const sx = max.x - min.y;
    const sy = max.y - min.y;
    const sz = max.z - min.z;
    this.displaySize.set(this.truncate(sx), this.truncate(sy), this.truncate(sz));

    const textHeight = 0.5;
    const textOffset = textHeight * 2;

    const x = new TextLabel(this.displaySize.x.toString(), color, textHeight, textOffset);
    x.position.set((max.x + min.x) * 0.5, max.y, max.z);
    x.rotation.set(Math.PI * 0.5, 0, 0);

    const y = new TextLabel(this.displaySize.y.toString(), color, textHeight, textOffset);
    y.position.set(max.x, (max.y + min.y) * 0.5, min.z);
    y.rotation.set(0, 0, -Math.PI * 0.5);

    const z = new TextLabel(this.displaySize.z.toString(), color, textHeight, textOffset);
    // z.position.set(max.x, min.y, (max.z + min.z) * 0.5);
    z.position.set(max.x, max.y, (max.z + min.z) * 0.5);
    z.rotation.set(Math.PI * 0.5, 0, -Math.PI * 0.5);

    this.labels = [
      x, y, z
    ];
    this.labels.forEach(lb => this.add(lb));
  }

  private clearLabels (): void {
    this.labels.forEach((sprite) => {
      this.remove(sprite);
      sprite.dispose();
    });
  }

  private truncate (v: number): number {
    const unit = 100;
    return Math.round(v * unit) / unit;
  }

  public setResolution (w: number, h: number, zoom: number): void {
    // this.material.uniforms.resolution.value.x = w;
    // this.material.uniforms.resolution.value.y = h;
    this.labels.forEach(lb => lb.setResolution(w, h, zoom));
  }
}
