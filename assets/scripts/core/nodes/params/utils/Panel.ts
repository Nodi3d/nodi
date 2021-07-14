import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import { TypedEvent } from '../../../misc/TypedEvent';
import NodeBase from '../../NodeBase';

export default class Panel extends NodeBase {
  private onOperated: TypedEvent<{ text: string }> = new TypedEvent();

  public get displayName (): string {
    return 'Panel';
  }

  public get previewable (): boolean {
    return false;
  }

  public setupViewElement (container: HTMLDivElement): void {
    const textarea = this.createPanelElement();
    container.append(textarea);
    this.onOperated.on(({ text }) => {
      textarea.value = text;
    });
    new ResizeObserver(() => {
      this.transform();
    }).observe(textarea);
  }

  private createPanelElement (): HTMLTextAreaElement {
    const textarea = document.createElement('textarea');
    textarea.classList.add('panel');
    textarea.readOnly = true;

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

  public registerInputs (manager: InputManager): void {
    manager.add('Input', '', DataTypes.ANY, AccessTypes.TREE);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('Output', '', DataTypes.ANY, AccessTypes.TREE);
  }

  public solve (access: DataAccess): void {
    const tree = access.getDataTree(0);
    access.setDataTree(0, tree);

    const threshold = 30;
    const values: any[] = [];
    const blen = tree.branches.length;
    for (let i = 0, n = Math.min(threshold, blen); i < n; i++) {
      if (i < threshold - 1) {
        const br = tree.branches[i];
        const value = [];
        const vlen = br.getValue().length;
        for (let j = 0, m = Math.min(threshold, vlen); j < m; j++) {
          if (j < threshold - 1) {
            value.push(br.getValue()[j]);
          } else {
            value.push(`and more... (${vlen})`);
          }
        }
        values.push({
          path: br.getPath().key,
          length: br.getValue().length,
          value
        });
      } else {
        values.push(`and more... (${blen})`);
      }
    }

    const text = JSON.stringify(values);
    this.onOperated.emit({ text });
  }
}
