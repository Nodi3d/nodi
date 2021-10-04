import { NodeJSONType, NodeBase } from '../NodeBase';
import { UINodeBase } from '../params/ui/UINodeBase';

export type ExporterNodeJSONType = NodeJSONType & {
  fileName?: string;
};

export abstract class ExporterNodeBase extends UINodeBase {
  protected abstract fileName: string;
  protected abstract get format(): string;

  public setupViewElement (container: HTMLDivElement): void {
    super.setupViewElement(container);

    const span = document.createElement('span');
    span.textContent = this.displayName;
    container.appendChild(span);
  }

  public toJSON (): ExporterNodeJSONType {
    const json = super.toJSON();
    return {
      ...json,
      ...{
        fileName: this.fileName
      }
    };
  }

  public fromJSON (json: ExporterNodeJSONType): void {
    this.fileName = json.fileName ?? this.fileName;
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
