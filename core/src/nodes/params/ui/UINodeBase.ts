
import { NodeJSONType, NodeBase } from '../../NodeBase';

export type UINodeJSONType = NodeJSONType & {
  label?: string;
  order?: number;
};

export abstract class UINodeBase extends NodeBase {
  private label: string = 'default';
  private order: number = 0;

  public get previewable (): boolean {
    return true;
  }

  public setupViewElement (container: HTMLDivElement): void {
    const span = this.createLabelSpan();
    span.style.position = 'absolute';
    span.style.fontSize = '0.7rem';
    span.style.whiteSpace = 'nowrap';
    span.style.top = '-16px';
    span.style.left = '0px';
    container.appendChild(span);
  }

  public abstract setupGUIElement (container: HTMLDivElement): void;

  public getLabel (): string {
    return this.label;
  }

  public setLabel (label: string): void {
    this.label = label;
    this.onStateChanged.emit({ node: this });
  }

  public getOrder (): number {
    return this.order;
  }

  public setOrder (order: number): void {
    this.order = order;
  }

  protected createGUILabelSpan (): HTMLSpanElement {
    const span = this.createLabelSpan();
    span.style.width = '100px';
    // span.style.wordBreak = 'break-all';
    span.style.userSelect = 'none';
    span.style.marginRight = 'auto';
    span.style.paddingRight = '4px';
    return span;
  }

  protected createLabelSpan (): HTMLSpanElement {
    const span = document.createElement('span');
    span.textContent = this.label;
    this.onStateChanged.on(() => {
      span.textContent = this.label;
    });
    return span;
  }

  public toJSON (): UINodeJSONType {
    return {
      ...super.toJSON(),
      ...{
        label: this.label,
        order: this.order
      }
    };
  }

  public fromJSON (json: UINodeJSONType): void {
    this.label = json.label ?? this.label;
    this.order = json.order ?? this.order;
    super.fromJSON(json);
  }
}
