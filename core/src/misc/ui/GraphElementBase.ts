import { IDOMHolder } from '~/src/misc/IDOMHolder';

export abstract class GraphElementBase implements IDOMHolder {
  public get dom (): HTMLDivElement {
    return this.container;
  }

  protected graphSize: number;
  protected handleSize: number;
  protected container: HTMLDivElement;
  protected graph: SVGElement;

  protected handles: SVGElement[] = [];
  protected dragging?: SVGElement;

  constructor (graphSize: number = 100, handleSize: number = 4) {
    this.graphSize = graphSize;
    this.handleSize = handleSize;
    this.handles = [];

    this.container = this.createContainer(this.graphSize);
    this.graph = this.createGraph(this.graphSize);
    this.container.appendChild(this.graph);

    const grid = this.createGrid(this.graphSize);
    this.graph.appendChild(grid);
  }

  protected createContainer (size: number): HTMLDivElement {
    const container = document.createElement('div');
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;

    container.addEventListener('mousedown', this.onMouseDown.bind(this));
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    container.addEventListener('mouseup', this.onMouseUp.bind(this));

    return container;
  }

  protected createGraph (size: number): SVGElement {
    const graph = this.createSVG(size);
    graph.style.pointerEvents = 'none';
    graph.classList.add('graph');
    return graph;
  }

  protected createSVG (size: number): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size.toString());
    svg.setAttribute('height', size.toString());
    return svg;
  }

  protected createGrid (size: number): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.pointerEvents = 'none';

    const step = size / 10;

    // draw gray lines
    for (let i = 0, n = 10; i <= n; i++) {
      const t = i / n;
      const x = i * step;
      const y = i * step;
      if (i !== 0 && i !== n && i !== 5) {
        const lv = this.createLine(x, 0, x, size, t);
        const lh = this.createLine(0, y, size, y, t);
        group.appendChild(lv);
        group.appendChild(lh);
      }
    }

    // draw black lines
    const hs = size * 0.5;
    group.appendChild(this.createLine(0, 0, 0, size, 0));
    group.appendChild(this.createLine(hs, 0, hs, size, 0.5));
    group.appendChild(this.createLine(size, 0, size, size, 1));
    group.appendChild(this.createLine(0, 0, size, 0, 0));
    group.appendChild(this.createLine(0, hs, size, hs, 0.5));
    group.appendChild(this.createLine(0, size, size, size, 1));

    return group;
  }

  protected createLine (x1: number, y1: number, x2: number, y2: number, t: number): SVGLineElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.style.pointerEvents = 'none';

    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke-width', '1');

    const d = Math.abs(t - 0.5);
    const color = (d < Number.EPSILON || 0.5 - Number.EPSILON < d) ? '#333' : '#ccc';
    line.setAttribute('stroke', color);
    return line;
  }

  protected createCircle (graphSize: number, handleSize: number, id: number = 0, cx: number = 0.5, cy: number = 0.5): SVGCircleElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.style.pointerEvents = 'none';

    circle.setAttribute('id', id.toString());
    circle.setAttribute('cx', (graphSize * cx).toString());
    circle.setAttribute('cy', (graphSize * cy).toString());
    circle.setAttribute('r', handleSize.toString());
    circle.setAttribute('stroke', '#18a0fb');
    circle.setAttribute('stroke-width', (handleSize * 0.5).toString());
    circle.setAttribute('stroke-location', 'inside');
    circle.setAttribute('fill', 'white');

    return circle;
  }

  protected onMouseDown (e: MouseEvent) {
    const ox = Number(e.offsetX);
    const oy = Number(e.offsetY);
    const intersection = this.handles.find((handle) => {
      const cx = Number(handle.getAttribute('cx'));
      const cy = Number(handle.getAttribute('cy'));
      const r = Number(handle.getAttribute('r'));
      const dx = ox - cx;
      const dy = oy - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      return d <= r;
    });
    if (intersection !== undefined) {
      this.dragging = intersection;
      e.stopPropagation();
    } else {
      this.dragging = undefined;
    }
  }

  private onMouseMove (e: MouseEvent) {
    // drag中にmouse leave → 領域外でmouseup → graph element上でmousemoveでdragされないように
    // e.which === 1のチェックを入れている
    if (this.dragging !== undefined && e.which === 1) {
      const ox = Number(e.offsetX);
      const oy = Number(e.offsetY);
      this.onMouseDrag(this.dragging, ox, oy);
      e.stopPropagation();
    }
  }

  protected onMouseDrag (handle: SVGElement, ox: number, oy: number) {
  }

  protected onMouseUp (e: MouseEvent) {
    if (this.dragging !== undefined) {
      e.stopPropagation();
    }
    this.dragging = undefined;
  }
}
