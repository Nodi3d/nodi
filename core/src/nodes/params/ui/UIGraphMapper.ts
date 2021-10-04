import { Vector2 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NBezier } from '../../../math/geometry/NBezier';
import { GraphMapType, GraphMapperElement } from '../../../misc/ui/GraphMapperElement';
import { UINodeJSONType, UINodeBase } from './UINodeBase';

abstract class GraphMapperBase {
  public get points (): Vector2[] {
    return this._points;
  }

  protected _points: Vector2[];
  protected abstract get size(): number;
  public abstract get type(): GraphMapType;

  constructor (points: Vector2[]) {
    this._points = points;
    this.validate();
  }

  private validate (): void {
    if (this._points.length !== this.size) {
      throw new Error(`the size of controls points must be ${this.size}`);
    }
  }

  public abstract map(t01: number): number;
}

class LinearMapper extends GraphMapperBase {
  public get type (): GraphMapType {
    return GraphMapType.Linear;
  }

  protected get size (): number {
    return 2;
  }

  constructor (points: Vector2[] = [
    new Vector2(0.25, 0.25),
    new Vector2(0.75, 0.75)
  ]) {
    super(points);
  }

  public map (t01: number): number {
    const p0 = this._points[0];
    const p1 = this._points[1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const slope = dy / dx;
    const interception = p0.y - p0.x * slope;
    return interception + t01 * slope;
  }
}

class BezierMapper extends GraphMapperBase {
  public get type (): GraphMapType {
    return GraphMapType.Bezier;
  }

  protected get size (): number {
    return 4;
  }

  constructor (points: Vector2[] = [
    new Vector2(0.0, 0.0),
    new Vector2(0.25, 0.25),
    new Vector2(0.75, 0.75),
    new Vector2(1.0, 1.0)
  ]) {
    super(points);
  }

  public map (t01: number): number {
    const p0 = this._points[0];
    const p1 = this._points[1];
    const p2 = this._points[2];
    const p3 = this._points[3];
    const bezier = new NBezier(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    return bezier.y(t01);
  }
}

export type UIGraphMapperJSONType = UINodeJSONType & {
  graphMapType?: string;
  graphMapControlPoints?: { x: number; y: number }[];
};

export class UIGraphMapper extends UINodeBase {
  get displayName (): string {
    return 'UIGraphMapper';
  }

  private mapper: GraphMapperBase = new BezierMapper();

  public setupViewElement (container: HTMLDivElement): void {
    const element = this.createMapperElement(80);
    container.appendChild(element.dom);
    super.setupViewElement(container);
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const element = this.createMapperElement(80);
    container.appendChild(element.dom);
  }

  private createMapperElement (graphSize: number): GraphMapperElement {
    const element = new GraphMapperElement(this.mapper.type, graphSize);
    this.onValueChanged.on(() => {
      element.update(this.mapper.type, this.mapper.points);
    });
    element.onValueChanged.on((e) => {
      this.mapper = this.createMapper(e.type, e.points);
      this.notifyValueChanged();
    });
    element.update(this.mapper.type, this.mapper.points);
    return element;
  }

  private createMapper (type: GraphMapType, points?: Vector2[]): GraphMapperBase {
    switch (type) {
      case GraphMapType.Linear:
        return new LinearMapper(points);
      case GraphMapType.Bezier:
        return new BezierMapper(points);
    }
    return new LinearMapper(points);
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const graphTypeId = 'ui-graph-mapper-type';
    const types = Object.values(GraphMapType);
    const html = `
      <ul>
        <li>
          <div>
            <label for='${graphTypeId}'>graph type</label>
            <select name='${graphTypeId}' id='${graphTypeId}' class='${graphTypeId} form-select input-block'>
              ${types.map((type) => { return `<option value='${type}'>${type}</option>`; })}
            </select>
          </div>
        </li>
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const numberTypeSelect = container.getElementsByClassName(graphTypeId)[0] as HTMLSelectElement;
    numberTypeSelect.selectedIndex = types.indexOf(this.mapper.type);
    numberTypeSelect.addEventListener('change', (e: Event) => {
      const select = e.target as HTMLSelectElement;
      const type = select.value;
      if (this.mapper.type !== type) {
        this.mapper = this.createMapper(type as GraphMapType);
        this.notifyValueChanged();
      }
    });
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Input value', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('O', 'Output value', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const i = access.getData(0) as number;
    const v = this.mapper.map(i);
    access.setData(0, v);
  }

  public toJSON (): UIGraphMapperJSONType {
    return {
      ...super.toJSON(),
      ...{
        graphMapType: this.mapper.type,
        graphMapControlPoints: this.mapper.points
      }
    };
  }

  public fromJSON (json: UIGraphMapperJSONType): void {
    const type = json.graphMapType ?? this.mapper.type;
    let points = this.mapper.points;
    if (json.graphMapControlPoints !== undefined) {
      points = json.graphMapControlPoints.map(p => new Vector2(p.x, p.y));
    }
    this.mapper = this.createMapper(type as GraphMapType, points);
    super.fromJSON(json);
    this.notifyValueChanged();
  }
}
