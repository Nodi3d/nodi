import { Vector2 } from 'three';
import DataAccess from '../../../data/DataAccess';
import { NodeEvent } from '../../../misc/Events';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NodeBase, { NodeJSONType } from '../../NodeBase';

export type CommentJSONType = NodeJSONType & {
  commentText?: string;
  commentLink?: string;
  commentStyle?: { [index: string]: string };
};

export default class Comment extends NodeBase {
  private text: string = 'Double click to write a comment';
  private link: string = '';
  private onSettingsChanged: NodeEvent = new NodeEvent();

  private style: { [index: string]: string } = {
    'font-size': '20px',
    'font-weight': 'normal',
    color: '#000000',
    'background-color': 'rgba(1.0, 1.0, 1.0, 0.0)'
  };

  public get displayName (): string {
    return 'Comment';
  }

  public get minHeight (): number {
    return 26;
  }

  public get flowable (): boolean {
    return false;
  }

  public get previewable (): boolean {
    return false;
  }

  public setupViewElement (container: HTMLDivElement): void {
    container.classList.add('comment-node');

    const preview = this.createTextPreview(this.text);
    container.appendChild(preview);

    const textArea = this.createTextArea(this.text);
    textArea.setAttribute('spellcheck', 'false');
    textArea.setAttribute('placeholder', 'comment...');
    textArea.addEventListener('change', () => {
      this.text = preview.textContent = textArea.value;
    });
    container.appendChild(textArea);

    const prev = new Vector2();

    preview.addEventListener('mousedown', (e: MouseEvent) => {
      prev.set(e.clientX, e.clientY);
    }, true);

    let timeout: number | undefined;
    const clearThrottleTransition = () => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
      timeout = undefined;
    };
    const throttleTransition = () => {
      clearThrottleTransition();
      timeout = window.setTimeout(() => {
        if (this.link.length > 0) {
          window.open(this.link, '_blank');
        }
        clearThrottleTransition();
      }, 200);
    };

    preview.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.which !== 1) { return; }
      const dx = prev.x - e.clientX;
      const dy = prev.y - e.clientY;
      const dragged = (dx * dx + dy * dy) > 1;
      if (!dragged) {
        throttleTransition();
      }
    }, false);

    preview.addEventListener('dblclick', (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      clearThrottleTransition();
      container.classList.add('editing');
      textArea.focus();
    }, false);

    textArea.addEventListener('blur', () => {
      container.classList.remove('editing');
      preview.textContent = textArea.value;
    }, false);

    new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          preview.style.width = `${width}px`;
          preview.style.height = `${height}px`;
        }
      }
    }).observe(textArea);

    this.onSettingsChanged.on(() => {
      preview.textContent = textArea.value = this.text;
      for (const key in this.style) {
        preview.style.setProperty(key, this.style[key]);
        textArea.style.setProperty(key, this.style[key]);
      }
    });
    this.onSettingsChanged.emit({ node: this });
  }

  private createTextArea (text: string): HTMLTextAreaElement {
    const textarea = document.createElement('textarea');
    textarea.addEventListener('click', (e) => {
      e.stopPropagation();
    }, false);
    textarea.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, false);
    textarea.addEventListener('mousedown', (e) => {
      if (e.which === 1) { e.stopPropagation(); }
    }, false);
    textarea.addEventListener('mouseup', (e) => {
      if (e.which === 1) { e.stopPropagation(); }
    }, false);
    textarea.addEventListener('mousehwheel', (e) => {
      e.stopPropagation();
    }, false);
    textarea.value = text;
    return textarea;
  }

  private createTextPreview (text: string): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('preview');
    div.textContent = text;
    return div;
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const commentLinkId = 'comment-link';
    const commentFontSizeId = 'comment-font-size';
    const commentFontWeightId = 'comment-font-weight';
    const commentFontColorId = 'comment-font-color';
    const commentBgColorId = 'comment-background-color';
    const commentBgAlphaId = 'comment-background-alpha';
    const html = `
      <ul>
        <li>
          <div>
            <label for='${commentLinkId}'>link</label>
            <input type='text' type='text' placeholder='ex. https://docs.nodi3d.com' name='${commentLinkId}' id='${commentLinkId}' class='form-control input-block ${commentLinkId}' />
          </div>
        </li>
        <li>
          <div class="">
            <label for='${commentFontSizeId}'>font size</label>
            <input type='text' name='${commentFontSizeId}' id='${commentFontSizeId}' class='form-control input-block ${commentFontSizeId}' />
          </div>
        </li>
        <li>
          <div>
            <label for='${commentFontWeightId}'>font weight</label>
            <select name='${commentFontWeightId}' id='${commentFontWeightId}' class='form-control input-block ${commentFontWeightId}'>
              <option value='normal'>Normal</option>
              <option value='bold'>Bold</option>
            </select>
          </div>
        </li>
        <li>
          <div>
            <label for='${commentFontColorId}'>font color</label>
            <input type='color' name='${commentFontColorId}' id='${commentFontColorId}' class='form-control input-block ${commentFontColorId}' />
          </div>
        </li>
        <li>
          <div>
            <label for='${commentBgColorId}'>background color</label>
            <input type='color' name='${commentBgColorId}' id='${commentBgColorId}' class='form-control input-block ${commentBgColorId}' />
          </div>
        </li>
        <li>
          <div>
            <label for='${commentBgAlphaId}'>background alpha</label>
            <input type='range' min='0.0' max='1.0' step='0.01' name='${commentBgAlphaId}' id='${commentBgAlphaId}' class='form-control input-block ${commentBgAlphaId} my-0' />
          </div>
        </li>
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const commentLinkHandler = (e: Event) => {
      this.link = (e.target as HTMLInputElement).value;
      this.onSettingsChanged.emit({ node: this });
    };
    const commentLinkInput = container.getElementsByClassName(commentLinkId)[0] as HTMLInputElement;
    commentLinkInput.value = this.link;
    commentLinkInput.addEventListener('input', commentLinkHandler);
    commentLinkInput.addEventListener('change', commentLinkHandler);

    const fontSizeHandler = (e: Event) => {
      this.style['font-size'] = (e.target as HTMLInputElement).value;
      this.onSettingsChanged.emit({ node: this });
    };
    const fontSizeInput = container.getElementsByClassName(commentFontSizeId)[0] as HTMLInputElement;
    fontSizeInput.value = this.style['font-size'];
    fontSizeInput.addEventListener('input', fontSizeHandler);
    fontSizeInput.addEventListener('change', fontSizeHandler);

    const fontWeightHandler = (e: Event) => {
      this.style['font-weight'] = (e.target as HTMLSelectElement).value;
      this.onSettingsChanged.emit({ node: this });
    };
    const fontWeightInput = container.getElementsByClassName(commentFontWeightId)[0] as HTMLSelectElement;
    fontWeightInput.selectedIndex = this.style['font-weight'] === 'normal' ? 0 : 1;
    fontWeightInput.addEventListener('input', fontWeightHandler);
    fontWeightInput.addEventListener('change', fontWeightHandler);

    const fontColorHandler = (e: Event) => {
      this.style.color = (e.target as HTMLInputElement).value;
      this.onSettingsChanged.emit({ node: this });
    };
    const fontColorInput = container.getElementsByClassName(commentFontColorId)[0] as HTMLInputElement;
    fontColorInput.value = this.style.color;
    fontColorInput.addEventListener('input', fontColorHandler);
    fontColorInput.addEventListener('change', fontColorHandler);

    const bgColorHandler = (e: Event) => {
      const hex = (e.target as HTMLInputElement).value;
      const result = this.hex2rgb(hex);
      const rgba = this.splitRgba(this.style['background-color']);
      const alpha = rgba[rgba.length - 1];
      this.style['background-color'] = `rgba(${result.r}, ${result.g}, ${result.b}, ${alpha})`;
      this.onSettingsChanged.emit({ node: this });
    };
    const bgColorInput = container.getElementsByClassName(commentBgColorId)[0] as HTMLInputElement;
    const rgba = this.splitRgba(this.style['background-color']);
    let r = Number.parseInt(rgba[0]).toString(16);
    let g = Number.parseInt(rgba[1]).toString(16);
    let b = Number.parseInt(rgba[2]).toString(16);
    if (r.length === 1) { r = '0' + r; }
    if (g.length === 1) { g = '0' + g; }
    if (b.length === 1) { b = '0' + b; }
    bgColorInput.value = '#' + r + g + b;
    bgColorInput.addEventListener('input', bgColorHandler);
    bgColorInput.addEventListener('change', bgColorHandler);

    const bgAlphaHandler = (e: Event) => {
      const rgba = this.splitRgba(this.style['background-color']);
      const alpha = (e.target as HTMLInputElement).value;
      this.style['background-color'] = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`;
      this.onSettingsChanged.emit({ node: this });
    };
    const bgAlphaInput = container.getElementsByClassName(commentBgAlphaId)[0] as HTMLInputElement;
    bgAlphaInput.value = rgba[rgba.length - 1];
    bgAlphaInput.addEventListener('input', bgAlphaHandler);
    bgAlphaInput.addEventListener('change', bgAlphaHandler);
    bgAlphaInput.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
    });
  }

  public registerInputs (manager: InputManager): void {
  }

  public registerOutputs (manager: OutputManager): void {
  }

  public solve (access: DataAccess): void {
  }

  private splitRgba (rgba: string): string[] {
    return rgba.replace('rgba(', '').replace(')', '').replace(/ /g, '').split(',');
  }

  private hex2rgb (hex: string): {
    r: number,
    g: number,
    b: number
  } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result === null) {
      return {
        r: 0,
        g: 0,
        b: 0
      };
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  public toJSON (): CommentJSONType {
    return {
      ...super.toJSON(),
      ...{
        commentText: this.text,
        commentLink: this.link,
        commentStyle: this.style
      }
    };
  }

  public fromJSON (json: CommentJSONType) {
    this.text = json.commentText ?? this.text;
    this.link = json.commentLink ?? this.link;
    this.style = json.commentStyle ?? this.style;
    this.onSettingsChanged.emit({ node: this });
    super.fromJSON(json);
  }
}
