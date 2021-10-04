
import { NSegment2D } from '@nodi/core';

export default class PolylineFigure {
  el: HTMLDivElement;
  svg: SVGSVGElement;
  line: SVGPolylineElement;
  points: number[] = [];

  constructor (width: number = 1) {
    this.el = this.createElement();
    this.svg = this.createSVG();
    this.line = this.createLine(width);
    this.svg.appendChild(this.line);
    this.el.appendChild(this.svg);
  }

  update (): void {
    let attr = '';

    const count = this.points.length;
    for (let i = 0; i < count; i += 2) {
      const x = this.points[i];
      const y = this.points[i + 1];
      attr += `${x},${y} `;
    }

    this.line.setAttribute('points', attr);
  }

  build (): NSegment2D[] {
    const segments = [];

    for (let i = 0, n = this.points.length - 2; i < n; i += 2) {
      const p0x = this.points[i]; const p0y = this.points[i + 1];
      const p1x = this.points[i + 2]; const p1y = this.points[i + 3];
      segments.push(new NSegment2D(p0x, p0y, p1x, p1y));
    }

    return segments;
  }

  add (x: number, y: number): void {
    this.move(x, y);
    this.points.push(x, y);
    this.update();
  }

  move (x: number, y: number): void {
    this.svg.setAttribute('x', `${x}`);
    this.svg.setAttribute('y', `${y}`);
  }

  createElement (): HTMLDivElement {
    const el = document.createElement('div');
    el.classList.add('polyline');
    return el;
  }

  createSVG (): SVGSVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  createLine (width = 1): SVGPolylineElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke-width', `${width}px`);
    return line;
  }

  dispose () {
    this.line.remove();
    this.svg.remove();
    this.el.remove();
  }
}
