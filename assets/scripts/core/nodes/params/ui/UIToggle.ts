import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import { NodeJSONType } from '../../NodeBase';
import UINodeBase from './UINodeBase';

export type UIToggleJSONType = NodeJSONType & {
  checked?: boolean;
};

export default class UIToggle extends UINodeBase {
  private checked: boolean = true;

  public get displayName (): string {
    return 'UIToggle';
  }

  public setupViewElement (container: HTMLDivElement): void {
    const checkbox = this.createCheckboxElement();
    container.append(checkbox);
    super.setupViewElement(container);
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const checkbox = this.createCheckboxElement();
    container.append(checkbox);
  }

  private createCheckboxElement (): HTMLInputElement {
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    input.addEventListener('mouseup', (e) => { e.stopPropagation(); });
    input.addEventListener('click', (e) => { e.stopPropagation(); });
    input.addEventListener('dblclick', (e) => { e.stopPropagation(); });
    input.addEventListener('change', (e) => {
      if (this.checked !== input.checked) {
        this.checked = input.checked;
        this.notifyValueChanged();
      }
    }, false);
    this.onValueChanged.on(() => {
      input.checked = this.checked;
    });
    input.checked = this.checked;
    return input;
  }

  public registerInputs (_manager: InputManager): void {
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('Output value', '', DataTypes.BOOLEAN, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    access.setData(0, this.checked);
  }

  public toJSON (): UIToggleJSONType {
    return {
      ...super.toJSON(),
      ...{
        checked: this.checked
      }
    };
  }

  public fromJSON (json: UIToggleJSONType): void {
    this.checked = json.checked ?? this.checked;
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
