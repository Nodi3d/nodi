
import { Vector2 } from 'three';
import { TypedEvent } from '../TypedEvent';
import { GraphElementBase } from './GraphElementBase';

export class MDSliderElement extends GraphElementBase {
  public onValueChanged: TypedEvent<{ x: number, y: number }> = new TypedEvent();

  public get x (): number {
    return this._x;
  }

  public get y (): number {
    return this._y;
  }

  private _x: number = 0.5;
  private _y: number = 0.5;

  constructor (graphSize: number = 100, handleSize: number = 6) {
    super(graphSize, handleSize);
    this.container.classList.add('md-slider');

    const circle = this.createCircle(this.graphSize, this.handleSize);
    this.graph.appendChild(circle);
    this.handles.push(circle);

    this.set(this._x, this._y);
  }

  get handle (): SVGElement {
    return this.handles[0];
  }

  get (ox: number, oy: number): Vector2 {
    return new Vector2(
      ox / this.graphSize,
      1 - oy / this.graphSize
    );
  }

  set (x: number, y: number, fire: boolean = false): void {
    this._x = Math.max(0, Math.min(x, 1));
    this._y = Math.max(0, Math.min(y, 1));

    const ox = this._x * this.graphSize;
    const oy = (1 - this._y) * this.graphSize;
    this.handle.setAttribute('cx', ox.toString());
    this.handle.setAttribute('cy', oy.toString());

    if (fire) { this.onValueChanged.emit({ x: this._x, y: this._y }); }
  }

  onMouseDrag (handle: SVGElement, ox: number, oy: number) {
    const x = ox / this.graphSize;
    const y = 1 - oy / this.graphSize;
    this.set(x, y, true);
  }
}
