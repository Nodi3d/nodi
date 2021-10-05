import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { NodeEvent } from '../../../misc/Events';
import { NumberTypes } from '../../../data/NumberTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { UINodeJSONType, UINodeBase } from './UINodeBase';

export type UINumberJSONType = UINodeJSONType & {
  numberType?: number;
  min?: number;
  max?: number;
  value?: number;
};

export class UINumber extends UINodeBase {
  get displayName (): string {
    return 'UINumber';
  }

  protected numberType: NumberTypes = NumberTypes.INTEGER;
  protected min: number = 0;
  protected max: number = 10;
  protected get interval (): number {
    let v = (this.max - this.min) / 100;
    v = Math.sign(v) * Math.min(Math.abs(v), 0.1);
    return (this.numberType === NumberTypes.INTEGER) ? 1 : v;
  }

  protected prev: number = 0;
  protected numberInputElement: HTMLInputElement | undefined;

  protected onSettingsChanged: NodeEvent = new NodeEvent();

  public setupViewElement (container: HTMLDivElement): void {
    this.numberInputElement = this.createNumberElement();
    container.appendChild(this.numberInputElement);
    super.setupViewElement(container);
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const numberTypeId = 'ui-number-number-type';
    const minId = 'ui-number-min';
    const maxId = 'ui-number-max';

    const html = `
      <ul>
        <li>
          <div>
            <label for='${numberTypeId}'>number type</label>
            <select name='${numberTypeId}' id='${numberTypeId}' class='${numberTypeId} form-select input-block'>
              <option value='${NumberTypes.INTEGER}'>Integer</option>
              <option value='${NumberTypes.FLOAT}'>Float</option>
            </select>
          </div>
        </li>
        <li>
          <div class="">
            <label for='${minId}'>min</label>
            <input type='text' type='number' name='${minId}' id='${minId}' class='form-control input-block ${minId}' />
          </div>
        </li>
        <li>
          <div class="">
            <label for='${maxId}'>max</label>
            <input type='text' type='number' name='${maxId}' id='${maxId}' class='form-control input-block ${maxId}' />
          </div>
        </li>
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const minHandler = (e: Event) => {
      const source = e.target as HTMLInputElement;
      this.min = Number(source.value);
      this.onSettingsChanged.emit({ node: this });
    };
    const maxHandler = (e: Event) => {
      const source = e.target as HTMLInputElement;
      this.max = Number(source.value);
      this.onSettingsChanged.emit({ node: this });
    };

    const numberTypeSelect = container.getElementsByClassName(numberTypeId)[0] as HTMLSelectElement;
    numberTypeSelect.selectedIndex = this.numberType;
    numberTypeSelect.addEventListener('change', (e: Event) => {
      const select = e.target as HTMLSelectElement;
      const type = Number(select.value) as NumberTypes;
      this.numberType = type;
      this.onSettingsChanged.emit({ node: this });
    });

    const minInput = container.getElementsByClassName(minId)[0] as HTMLInputElement;
    minInput.value = this.min.toString();
    minInput.addEventListener('input', minHandler);
    minInput.addEventListener('change', minHandler);

    const maxInput = container.getElementsByClassName(maxId)[0] as HTMLInputElement;
    maxInput.value = this.max.toString();
    maxInput.addEventListener('input', maxHandler);
    maxInput.addEventListener('change', maxHandler);
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const el = this.createNumberElement();
    el.style.width = '80px';
    container.appendChild(el);
  }

  protected createNumberElement () {
    const input = document.createElement('input');
    input.classList.add('webkit-spin-button');
    input.setAttribute('type', 'number');
    input.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    }, false);

    input.addEventListener('change', this.onNumberValueChanged.bind(this));
    input.addEventListener('mouseup', this.onNumberValueChanged.bind(this));
    input.addEventListener('keyup', this.onNumberValueChanged.bind(this));
    input.addEventListener('paste', this.onNumberValueChanged.bind(this));
    input.addEventListener('dblclick', (e) => { e.stopPropagation(); }, false);

    input.value = this.prev.toString();

    this.onSettingsChanged.on(() => {
      input.min = this.min.toString();
      input.max = this.max.toString();
      input.step = this.interval.toString();
    });

    this.onValueChanged.on(() => {
      input.value = this.prev.toString();
    });

    return input;
  }

  public registerInputs (_manager: InputManager): void {
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('O', 'Output value', DataTypes.NUMBER, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    access.setData(0, Number(this.prev));
  }

  public setNumberValue (value: number): UINumber {
    const prev = this.prev;
    this.prev = value;
    if (prev !== value) {
      this.notifyValueChanged();
    }
    return this;
  }

  protected onNumberValueChanged (e: Event): void {
    const element = e.target as HTMLInputElement;
    const value = Number(element.value);
    const prev = this.prev;
    this.prev = value;
    if (prev !== value) {
      this.notifyValueChanged();
    }
  }

  public toJSON (name: string): UINumberJSONType {
    return {
      ...super.toJSON(name),
      ...{
        value: this.prev,
        numberType: this.numberType,
        min: this.min,
        max: this.max
      }
    };
  }

  public fromJSON (json: UINumberJSONType): void {
    this.prev = json.value ?? this.prev;
    this.numberType = json.numberType ?? this.numberType;
    this.min = json.min ?? this.min;
    this.max = json.max ?? this.max;
    this.notifyValueChanged();
    this.onSettingsChanged.emit({ node: this });
    super.fromJSON(json);
  }

  public dispose (): void {
    this.onSettingsChanged.dispose();
    super.dispose();
  }
}
