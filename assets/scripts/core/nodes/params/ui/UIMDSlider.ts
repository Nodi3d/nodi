import { Vector2 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { NodeEvent } from '../../../misc/Events';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NPlane from '../../../math/geometry/NPlane';
import MDSliderElement from '../../../misc/ui/MDSliderElement';
import UINodeBase, { UINodeJSONType } from './UINodeBase';

export type UIMDSliderJSONType = UINodeJSONType & {
  sliderX?: number;
  sliderY?: number;
};

export default class UIMDSlider extends UINodeBase {
  private prev: Vector2 = new Vector2();

  get displayName (): string {
    return 'UIMDNumber';
  }

  public setupViewElement (container: HTMLDivElement): void {
    const element = new MDSliderElement();
    element.onValueChanged.on((e) => {
      this.prev.set(e.x, e.y);
      this.notifyValueChanged();
    });
    this.onValueChanged.on(() => {
      element.set(this.prev.x, this.prev.y);
    });
    container.appendChild(element.dom);
    super.setupViewElement(container);
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const element = new MDSliderElement(80);
    element.onValueChanged.on((e) => {
      this.prev.set(e.x, e.y);
      this.notifyValueChanged();
    });
    this.onValueChanged.on(() => {
      element.set(this.prev.x, this.prev.y);
    });
    container.appendChild(element.dom);
  }

  public registerInputs (manager: InputManager): void {
    manager.add('b', 'Base plane', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('O', 'Output value', DataTypes.VECTOR, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(0) as NPlane;
    const v = plane.xAxis.clone().multiplyScalar(this.prev.x).add(plane.yAxis.clone().multiplyScalar(this.prev.y));
    access.setData(0, v);
  }

  public toJSON (): UIMDSliderJSONType {
    return {
      ...super.toJSON(),
      ...{
        sliderX: this.prev.x,
        sliderY: this.prev.y
      }
    };
  }

  public fromJSON (json: UIMDSliderJSONType): void {
    this.prev.x = json.sliderX ?? this.prev.x;
    this.prev.y = json.sliderY ?? this.prev.y;
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
