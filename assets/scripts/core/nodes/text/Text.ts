
import { AccessTypes } from '../../data/AccessTypes';
import DataAccess from '../../data/DataAccess';
import DataTree from '../../data/DataTree';
import { DataTypes } from '../../data/DataTypes';
import InputManager from '../../io/InputManager';
import OutputManager from '../../io/OutputManager';
import { TypedEvent } from '../../misc/TypedEvent';
import NodeBase, { NodeJSONType } from '../NodeBase';

export type TextJSONType = NodeJSONType & {
  fileName?: string;
};

export default class Text extends NodeBase {
  private fileName: string = 'download.txt';
  private _text: string = '';
  private onTextChanged: TypedEvent<{ text: string }> = new TypedEvent();

  public get displayName (): string {
    return 'Text';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('t', 'Input string', DataTypes.ANY, AccessTypes.TREE).setDefault(new DataTree().add(['']));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('o', 'Output string', DataTypes.STRING, AccessTypes.TREE);
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const fileNameId = 'dxf-exporter-label';
    const buttonId = 'dxf-exporter-button';

    const html = `
      <ul>
        <li>
          <div class="">
            <label for='${fileNameId}'>File name</label>
            <input type='text' name='${fileNameId}' id='${fileNameId}' class='form-control input-block ${fileNameId}' />
          </div>
        </li>
        <li class='px-0'>
          <div>
            <button class='btn btn-block dark-theme ${buttonId}' id='${buttonId}'>Download</button>
          </div>
        </li>
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const input = container.getElementsByClassName(fileNameId)[0] as HTMLInputElement;
    input.value = this.fileName;
    const button = container.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    input.addEventListener('change', (e) => {
      this.fileName = input.value;
    });
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.download(input.value);
    });
  }

  public setupViewElement (container: HTMLDivElement): void {
    const textarea = this.createPanelElement();
    container.appendChild(textarea);

    this.onTextChanged.on(({ text }) => {
      if (textarea.value !== text) {
        textarea.value = text;
      }
    });

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
    const value = (e.target as HTMLTextAreaElement).value;
    const input = this.inputManager.getInput(0);
    input.getDefault().getBranchByIndex(0)?.setValue([value]);
    this.notifyValueChanged();
  }

  public solve (access: DataAccess): void {
    const tree = access.getDataTree(0);

    const values = tree.branches.map((br) => {
      return br.getValue().map(v => v.toString()).join('\n');
    });
    const text = values.join('\n');
    this._text = text;
    this.onTextChanged.emit({ text });

    access.setDataTree(0, tree);
  }

  private download (name: string): void {
    const blob = new Blob([this._text], { type: 'text/plain' });

    const a = document.createElement('a');
    const e = document.createEvent('MouseEvent');
    const url = window.URL.createObjectURL(blob);

    a.download = name;
    a.href = url;

    e.initEvent('click', true, true);
    a.dispatchEvent(e);
  }

  public dispose (): void {
    super.dispose();
    this.onTextChanged.dispose();
  }

  public toJSON (): TextJSONType {
    const json = super.toJSON();
    return {
      ...json,
      ...{
        fileName: this.fileName
      }
    };
  }

  public fromJSON (json: TextJSONType): void {
    this.fileName = json.fileName ?? this.fileName;
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
