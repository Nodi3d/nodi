import { Vector2 } from 'three';
import IDisposable from '../IDisposable';
import { TypedEvent } from '../TypedEvent';
import GraphElementBase from './GraphElementBase';

export enum GraphMapType {
  Linear = 'Linear',
  Bezier = 'Bezier',
}

export default class GraphMapperElement extends GraphElementBase implements IDisposable {
  public onValueChanged: TypedEvent<{ type: GraphMapType; points: Vector2[]; }> = new TypedEvent();

  private type: GraphMapType;
  private path: SVGPathElement;

  constructor (type: GraphMapType = GraphMapType.Bezier, graphSize: number = 100, handleSize: number = 6) {
    super(graphSize, handleSize);
    this.type = type;
    this.container.classList.add('graph-mapper');
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.graph.append(this.path);

    this.update(this.type);
  }

  private approximately (type: GraphMapType, points: Vector2[] = []): boolean {
    if (this.type !== type) { return false; }

    const controls = this.controls;
    const n = controls.length;
    if (n !== points.length) { return false; }

    for (let i = 0; i < n; i++) {
      if (!controls[i].equals(points[i])) { return false; }
    }

    return true;
  }

  public update (type: GraphMapType, points: Vector2[] = []): void {
    if (points.length !== 0 && this.approximately(type, points)) { return; }

    if (this.handles.length > 0) {
      this.handles.forEach((handle) => {
        handle.remove();
      });
      this.handles = [];
    }

    this.type = type;
    switch (this.type) {
      case GraphMapType.Bezier: {
        this.handles = [
          this.createCircle(this.graphSize, this.handleSize, 0, 0, 1),
          this.createCircle(this.graphSize, this.handleSize, 1, 0.25, 0.75),
          this.createCircle(this.graphSize, this.handleSize, 2, 0.75, 0.25),
          this.createCircle(this.graphSize, this.handleSize, 3, 1, 0)
        ];
        break;
      }
      default: {
        this.handles = [
          this.createCircle(this.graphSize, this.handleSize, 0, 0.25, 0.75),
          this.createCircle(this.graphSize, this.handleSize, 1, 0.75, 0.25)
        ];
        break;
      }
    }
    this.handles.forEach((handle) => {
      this.graph.appendChild(handle);
    });

    if (points.length !== 0) {
      this.controls = points;
    }

    this.updatePath();
  }

  private get positions (): Vector2[] {
    return this.handles.map((handle) => {
      const cx = handle.getAttribute('cx');
      const cy = handle.getAttribute('cy');
      return new Vector2(
        Number(cx),
        Number(cy)
      );
    });
  }

  get controls (): Vector2[] {
    return this.positions.map((p) => {
      return new Vector2(
        Number(p.x) / this.graphSize,
        1 - Number(p.y) / this.graphSize
      );
    });
  }

  set controls (controls: Vector2[]) {
    this.handles.forEach((handle, i) => {
      const p = controls[i];
      const cx = p.x * this.graphSize;
      const cy = (1 - p.y) * this.graphSize;
      handle.setAttribute('cx', cx.toString());
      handle.setAttribute('cy', cy.toString());
    });
  }

  updatePath () {
    const ps = this.positions;

    switch (this.type) {
      case GraphMapType.Bezier: {
        const attrib = `M ${ps[0].x},${ps[0].y} C ${ps[1].x},${ps[1].y} ${ps[2].x},${ps[2].y} ${ps[3].x},${ps[3].y}`;
        this.path.setAttribute('d', attrib);
        break;
      }
      case GraphMapType.Linear: {
        const x0 = ps[0].x;
        const y0 = ps[0].y;
        const x1 = ps[1].x;
        const y1 = ps[1].y;
        const dx = x1 - x0;
        const dy = y1 - y0;
        const slope = dy / dx;
        const interception = y0 - slope * x0;
        const attrib = `M ${0},${interception} L ${this.graphSize},${((this.graphSize * slope + interception))}`;
        this.path.setAttribute('d', attrib);
        break;
      }
    }
  }

  constrain (ox: number, min: number, max: number): number {
    const prev = this.handles.find((other) => {
      return parseInt(other.getAttribute('id') as string) === min;
    });
    const next = this.handles.find((other) => {
      return parseInt(other.getAttribute('id') as string) === max;
    });
    if (prev !== undefined) {
      ox = Math.max(ox, parseInt(prev.getAttribute('cx') as string) + 1);
    }
    if (next !== undefined) {
      ox = Math.min(ox, parseInt(next.getAttribute('cx') as string) - 1);
    }
    return ox;
  }

  onMouseDrag (handle: SVGElement, ox: number, oy: number) {
    const id = parseInt(handle.getAttribute('id') as string);

    switch (this.type) {
      case GraphMapType.Linear: {
        ox = this.constrain(ox, id - 1, id + 1);
        break;
      }
      case GraphMapType.Bezier: {
        if (id <= 1) {
          ox = this.constrain(ox, id - 1, id + 2);
        } else {
          ox = this.constrain(ox, id - 2, id + 1);
        }
        break;
      }
    }

    handle.setAttribute('cx', ox.toString());
    handle.setAttribute('cy', oy.toString());
    this.updatePath();

    this.onValueChanged.emit({ type: this.type, points: this.controls });
  }

  dispose (): void {
    this.onValueChanged.dispose();
  }
}
