import { AccessTypes } from '../data/AccessTypes';
import { DataAccess } from '../data/DataAccess';
import { InputManager } from '../io/InputManager';
import { OutputManager } from '../io/OutputManager';
import { NodeJSONType, NodeBase } from './NodeBase';

export class Unknown extends NodeBase {
  public get name (): string {
    return this.unknownNodeName;
  }

  private unknownNodeName: string = 'Unknown';

  public get displayName (): string {
    return '';
  }

  public get flowable (): boolean {
    return false;
  }

  public get previewable (): boolean {
    return false;
  }

  public registerInputs (manager: InputManager): void {
  }

  public registerOutputs (manager: OutputManager): void {
  }

  public solve (access: DataAccess): void {
  }

  public setupViewElement (container: HTMLDivElement): void {
    super.setupViewElement(container);
    container.classList.add('unknown-node');
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const html = `
      <div>
        <span class="text-red">Unknown node: ${this.unknownNodeName} ⚠️</span>
      </div>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);
  }

  public fromJSON (json: NodeJSONType): void {
    this.unknownNodeName = json.name ?? this.unknownNodeName;
    json.inputs.forEach((i) => {
      this.inputManager.add(i.name ?? '', i.comment ?? '', i.dataType, i.accessType ?? AccessTypes.ITEM);
    });
    json.outputs.forEach((o) => {
      this.outputManager.add(o.name ?? '', o.comment ?? '', o.dataType, o.accessType ?? AccessTypes.ITEM);
    });
    super.fromJSON(json);
  }

  public toJSON (): NodeJSONType {
    return {
      ...super.toJSON(),
      name: this.unknownNodeName
    };
  }
}
