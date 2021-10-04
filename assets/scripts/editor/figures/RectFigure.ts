
import Editor from '../Editor';
import NodeView from '../views/NodeView';

export default class RectFigure {
  el: HTMLDivElement;
  svg: SVGSVGElement;
  rect: SVGRectElement;

  sx: number;
  sy: number;
  ex: number;
  ey: number;

  constructor () {
    this.el = this.createElement();
    this.svg = this.createSVG();
    this.rect = this.createRect();
    this.svg.appendChild(this.rect);
    this.el.appendChild(this.svg);

    this.sx = 0;
    this.sy = 0;
    this.ex = 0;
    this.ey = 0;
  }

  move (x: number, y: number): void {
    this.svg.setAttribute('x', `${x}`);
    this.svg.setAttribute('y', `${y}`);
  }

  update (x0: number, y0: number, x1: number, y1: number): void {
    this.sx = Math.min(x0, x1);
    this.sy = Math.min(y0, y1);
    this.ex = Math.max(x0, x1);
    this.ey = Math.max(y0, y1);
    this.move(this.sx, this.sy);
    this.rect.setAttribute('x', `${this.sx}`);
    this.rect.setAttribute('y', `${this.sy}`);
    this.rect.setAttribute('width', `${this.ex - this.sx}`);
    this.rect.setAttribute('height', `${this.ey - this.sy}`);
  }

  intersects (parent: Editor, node: NodeView): boolean {
    const pr = parent.el.getBoundingClientRect();
    const r = node.dom.getBoundingClientRect();

    const min = parent.getWorld(r.left - pr.x, r.top - pr.y);
    const max = parent.getWorld(r.right - pr.x, r.bottom - pr.y);

    const x0 = min.x; const x1 = max.x;
    const x2 = this.sx; const x3 = this.ex;

    const y0 = min.y; const y1 = max.y;
    const y2 = this.sy; const y3 = this.ey;

    const bx = (x3 - x0) * (x2 - x1);
    const by = (y3 - y0) * (y2 - y1);
    return bx <= 0 && by <= 0;
  }

  area (): number {
    const dx = this.ex - this.sx;
    const dy = this.ey - this.sy;
    return Math.sqrt(dx * dx) * Math.sqrt(dy * dy);
  }

  createElement (): HTMLDivElement {
    const el = document.createElement('div');
    el.classList.add('rect');
    return el;
  }

  createSVG (): SVGSVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  createRect (): SVGRectElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  }

  dispose (): void {
    this.rect.remove();
    this.svg.remove();
    this.el.remove();
  }
}
