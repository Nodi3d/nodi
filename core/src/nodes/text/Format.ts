
import { AccessTypes } from '../../data/AccessTypes';
import { DataAccess } from '../../data/DataAccess';
import { DataTypes } from '../../data/DataTypes';
import { InputManager } from '../../io/InputManager';
import { OutputManager } from '../../io/OutputManager';
import { TypedEvent } from '../../misc/TypedEvent';
import { NodeJSONType } from '../NodeBase';
import { VariableInputNodeBase } from '../VariableInputNodeBase';

export type FormatJSONType = NodeJSONType & {
  expression?: string;
};

export class Format extends VariableInputNodeBase {
  private onExpressionChanged: TypedEvent<{ expression: string }> = new TypedEvent();
  // eslint-disable-next-line no-template-curly-in-string
  private expression: string = '`sample text ${$i0}`';

  protected createInput (manager: InputManager, index: number): void {
    manager.add(`${index}`, `$i${index}`, DataTypes.ANY, AccessTypes.ITEM);
  }

  protected getDefaultInputCount (): number {
    return 1;
  }

  public getMinInputCount (): number {
    return 1;
  }

  public getMaxInputCount (): number {
    return 8;
  }

  public get displayName (): string {
    return 'Format';
  }

  public registerInputs (manager: InputManager): void {
    const count = this.getDefaultInputCount();
    for (let i = 0; i < count; i++) {
      this.createInput(manager, i);
    }
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Output string', DataTypes.STRING, AccessTypes.ITEM);
  }

  public setupViewElement (container: HTMLDivElement): void {
    const textarea = this.createPanelElement();
    container.appendChild(textarea);
    this.onExpressionChanged.on(({ expression }) => {
      textarea.value = expression;
    });
    textarea.value = this.expression;
    new ResizeObserver(() => {
      this.transform();
    }).observe(textarea);
  }

  private createPanelElement (): HTMLTextAreaElement {
    const textarea = document.createElement('textarea');
    textarea.classList.add('text');
    textarea.addEventListener('change', this.onTextValueChanged.bind(this));
    textarea.addEventListener('keyup', this.onTextValueChanged.bind(this));
    textarea.addEventListener('paste', this.onTextValueChanged.bind(this));
    textarea.addEventListener('dblclick', (e) => {
      e.stopPropagation();
    }, false);
    textarea.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    }, false);
    textarea.addEventListener('mouseup', (e) => {
      e.stopPropagation();
    }, false);
    textarea.addEventListener('mousehwheel', (e) => {
      e.stopPropagation();
    }, false);
    return textarea;
  }

  private onTextValueChanged (e: Event) {
    this.expression = (e.target as HTMLTextAreaElement).value;
    this.notifyValueChanged();
  }

  public solve (access: DataAccess): void {
    const context: { [index:string]: any } = {};
    const n = access.getInputCount();
    for (let i = 0; i < n; i++) {
      context[`$i${i}`] = access.getData(i);
    }
    const expression = `return ${this.expression}`;

    // eslint-disable-next-line no-new-func
    const f = new Function(...Object.keys(context), expression);
    const result = f(...Object.values(context));
    access.setData(0, result);
  }

  public dispose (): void {
    this.onExpressionChanged.dispose();
    super.dispose();
  }

  public toJSON (): FormatJSONType {
    const json = super.toJSON();
    return {
      ...json,
      ...{
        expression: this.expression
      }
    };
  }

  public fromJSON (json: FormatJSONType): void {
    this.expression = json.expression ?? this.expression;
    this.onExpressionChanged.emit({ expression: this.expression });
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
