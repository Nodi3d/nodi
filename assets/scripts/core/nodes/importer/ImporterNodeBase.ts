import InputManager from '../../io/InputManager';
import { TypedEvent } from '../../misc/TypedEvent';
import AsyncNodeBase from '../AsyncNodeBase';
import IImporterNode, { ImportFileArg } from '../IImporterNode';
import { NodeJSONType } from '../NodeBase';

export type ImporterNodeJSONType = NodeJSONType & {
  fileName?: string;
  fileUrl?: string;
};

export default abstract class ImporterNodeBase extends AsyncNodeBase implements IImporterNode {
  protected fileName: string = '';
  protected fileUrl: string = '';
  onImportFile: TypedEvent<ImportFileArg> = new TypedEvent();
  protected abstract get folder(): string;

  public registerInputs (_manager: InputManager): void {
  }

  public setupViewElement (container: HTMLDivElement): void {
    const nameLabel = document.createElement('span');
    nameLabel.classList.add('name');
    nameLabel.style.position = 'absolute';
    nameLabel.style.left = '0px';
    nameLabel.style.top = '-16px';
    nameLabel.style.whiteSpace = 'nowrap';
    this.onValueChanged.on(() => {
      nameLabel.textContent = this.fileName;
    });
    nameLabel.textContent = this.fileName;

    container.appendChild(nameLabel);

    super.setupViewElement(container);
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const importButtonId = 'mesh-import-button';
    const downloadButtonId = 'mesh-download-button';

    const html = `
      <ul>
        <li class='px-0'>
          <div>
            <button class='btn btn-block rounded-0 dark-theme ${importButtonId}' id='${importButtonId}'>Import</button>
          </div>
        </li>
        <li class='px-0'>
          <div>
            <button class='btn btn-block rounded-0 dark-theme ${downloadButtonId}' id='${downloadButtonId}'>Download</button>
          </div>
        </li>
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const importButton = container.getElementsByClassName(importButtonId)[0] as HTMLButtonElement;
    importButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.import();
    });
    this.onStateChanged.on(() => {
      importButton.disabled = this.processing;
    });

    const downloadButton = container.getElementsByClassName(downloadButtonId)[0] as HTMLButtonElement;
    downloadButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.download();
    });
    downloadButton.disabled = this.fileUrl.length <= 0;
    this.onValueChanged.on(() => {
      downloadButton.disabled = this.fileUrl.length <= 0;
    });
  }

  protected abstract import (): void;

  public registerFile (key: string, name: string, url: string): void {
    this.fileName = name;
    this.fileUrl = url;
    this.notifyValueChanged();
  }

  protected download (): void {
    const a = document.createElement('a');
    const e = document.createEvent('MouseEvent');

    a.download = this.fileName;
    a.href = this.fileUrl;

    e.initEvent('click', true, true);
    a.dispatchEvent(e);
  }

  protected read (file: File): void {
    // byte
    const limitMB = 50; // 1e6 = mb
    if (file.size >= limitMB * 1e6) {
      window.alert(`File size exceeds ${limitMB}MB. (β version restriction)`);
      return;
    }

    this.processing = true;

    const reader = new FileReader();
    reader.addEventListener('error', () => {
      this.processing = false;
    });
    reader.addEventListener('loadend', () => {
      if (reader.result !== null) {
        const blob = new Blob([reader.result], { type: 'application/octet-binary' });
        this.onImportFile.emit({
          blob, key: '', name: file.name, folder: this.folder
        });
      }
    });
    reader.readAsArrayBuffer(file);
  }

  toJSON (): ImporterNodeJSONType {
    return {
      ...super.toJSON(),
      ...{
        fileName: this.fileName,
        fileUrl: this.fileUrl
      }
    };
  }

  fromJSON (json: ImporterNodeJSONType) {
    this.fileName = json.fileName ?? this.fileName;
    this.fileUrl = json.fileUrl ?? this.fileUrl;
    super.fromJSON(json);
  }
}
