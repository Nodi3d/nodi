import { Vector2 } from 'three';
import { NBezier, NSegment2D } from '@nodi/core';
import View from './View';

export default abstract class EdgeViewBase extends View {
  protected svg: SVGSVGElement;
  protected path: SVGPathElement;
  protected bezier: NBezier;

  constructor () {
    super('edge');

    this.svg = this.createSVG();
    this.path = this.createPath();
    this.bezier = new NBezier();

    this.svg.appendChild(this.path);
    this.dom.appendChild(this.svg);
  }

  protected createSVG (w: number = 32, h: number = 32): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', `${w}`);
    svg.setAttribute('height', `${h}`);
    return svg;
  }

  protected createPath (): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    return path;
  }

  public build (): NSegment2D[] {
    return this.bezier.build();
  }

  protected updateBezier (sx: number, sy: number, ex: number, ey: number) {
    sy = sy + 0.5;
    ey = ey + 0.5;

    let dx = Math.abs(ex - sx) * 0.5;
    const dy = Math.abs(ey - sy);
    dx = Math.max(dx, Math.min(dy, 50));

    const c0x = sx + dx;
    const c0y = sy;
    const c1x = ex - dx;
    const c1y = ey;

    const attrib = `M ${sx},${sy} C ${c0x},${c0y} ${c1x},${c1y} ${ex},${ey}`;
    this.path.setAttribute('d', attrib);
    this.bezier.update(sx, sy, c0x, c0y, c1x, c1y, ex, ey);
  }

  public select (): void {
    this.path.classList.add('selected');
  }

  public unselect (): void {
    this.path.classList.remove('selected');
  }

  public move (p: Vector2): void {
    this.svg.setAttribute('x', `${p.x}`);
    this.svg.setAttribute('y', `${p.y}`);
  }

  public dispose (): void {
    this.path.remove();
    this.svg.remove();
    super.dispose();
  }
}
