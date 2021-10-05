import { v4 } from 'uuid';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { NodeEvent } from '../../../misc/Events';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NodeJSONType } from '../../NodeBase';
import { UINodeBase } from './UINodeBase';

export type UIValueListJSONType = NodeJSONType & {
  prev?: number;
  valueListKeys?: string[];
};

export class UIValueList extends UINodeBase {
  protected onSettingsChanged: NodeEvent = new NodeEvent();

  private prev: number = 0;
  private valueListKeys: string[] = ['One', 'Two', 'Three'];

  public get displayName (): string {
    return 'UIValueList';
  }

  public setupViewElement (container: HTMLDivElement): void {
    const select = this.createSelectElement();
    container.append(select);
    super.setupViewElement(container);
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const select = this.createSelectElement();
    select.style.width = '80px';
    container.append(select);
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const valuelistId = 'ui-value-list-ul';
    const html = `
      <ul class="${valuelistId}">
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const ul = container.getElementsByClassName(valuelistId)[0] as HTMLUListElement;
    this.setupInspectorUListElement(ul);
  }

  private setupInspectorUListElement (ul: HTMLUListElement): void {
    while (ul.lastChild !== null) { ul.removeChild(ul.lastChild); }

    const { li: last, button } = this.appendRegisterElement(ul);
    button.addEventListener('click', () => {
      this.valueListKeys.push('Default');
      this.notifyValueChanged();
      this.setupInspectorUListElement(ul);
    });

    this.valueListKeys.forEach((key, index) => {
      const { button, input } = this.appendValueElement(ul, last, key, index);
      button.disabled = this.valueListKeys.length <= 1;
      button.addEventListener('click', () => {
        if (this.valueListKeys.length <= 1) { return; }
        this.valueListKeys.splice(index, 1);
        this.notifyValueChanged();
        this.setupInspectorUListElement(ul);
      });
      input.addEventListener('input', () => {
        this.valueListKeys[index] = input.value;
        this.onSettingsChanged.emit({ node: this });
      });
    });
  }

  private appendValueElement (ul: HTMLUListElement, last: HTMLLIElement, key: string, index: number): { li: HTMLLIElement, button: HTMLButtonElement; input: HTMLInputElement} {
    const liId = v4();
    const buttonId = v4();
    const inputId = v4();
    const html = `
      <li class="${liId} d-flex">
        <button class="${buttonId} btn f2 dark-theme" style="width: 50px;">-</button>
        <input class="${inputId} ml-2 form-control flex-1" type="text" value="${key}" />
      </li>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    ul.insertBefore(template.content, last);

    const li = ul.getElementsByClassName(liId)[0] as HTMLLIElement;
    const button = ul.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    const input = ul.getElementsByClassName(inputId)[0] as HTMLInputElement;
    return {
      li, button, input
    };
  }

  private appendRegisterElement (ul: HTMLUListElement): { li:HTMLLIElement, button: HTMLButtonElement } {
    const liId = v4();
    const buttonId = v4();
    const html = `
        <li class="${liId}">
          <button id="${buttonId}" style="width: 50px;" class="${buttonId} btn btm-sm dark-theme">+</button>
        </li>
    `;

    const template = document.createElement('template');
    template.innerHTML = html;
    ul.appendChild(template.content);

    const li = ul.getElementsByClassName(liId)[0] as HTMLLIElement;
    const button = ul.getElementsByClassName(buttonId)[0] as HTMLButtonElement;

    return {
      li, button
    };
  }

  private createSelectElement (): HTMLSelectElement {
    const select = document.createElement('select');
    select.addEventListener('change', () => {
      if (this.prev !== select.selectedIndex) {
        this.prev = select.selectedIndex;
        this.notifyValueChanged();
      }
    });
    select.addEventListener('dblclick', (e) => { e.stopPropagation(); }, false);
    this.setupSelectElement(select);
    this.onValueChanged.on(() => {
      this.setupSelectElement(select);
      select.selectedIndex = this.prev;
    });
    this.onSettingsChanged.on(() => {
      this.setupSelectElement(select);
    });
    select.selectedIndex = this.prev;
    return select;
  }

  private setupSelectElement (element: HTMLSelectElement): void {
    const selected = element.value;

    while (element.lastChild !== null) {
      element.removeChild(element.lastChild);
    }

    this.valueListKeys.forEach((key, index) => {
      const option = document.createElement('option');
      option.setAttribute('value', index.toString());
      option.textContent = key;
      element.appendChild(option);
    });

    element.value = selected;
  }

  public registerInputs (_manager: InputManager): void {
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('Output value', '', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    access.setData(0, this.prev);
  }

  public toJSON (name: string): UIValueListJSONType {
    return {
      ...super.toJSON(name),
      ...{
        prev: this.prev,
        valueListKeys: this.valueListKeys
      }
    };
  }

  public fromJSON (json: UIValueListJSONType): void {
    const prev = Number(json.prev);
    this.prev = (json.prev === undefined || isNaN(prev)) ? this.prev : prev;
    this.valueListKeys = json.valueListKeys ?? this.valueListKeys;
    this.notifyValueChanged();
    super.fromJSON(json);
  }

  public dispose (): void {
    this.onSettingsChanged.dispose();
    super.dispose();
  }
}
