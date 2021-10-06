import { Color, DoubleSide, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { AccessTypes } from '../../data/AccessTypes';
import { DataAccess } from '../../data/DataAccess';
import { DataTree } from '../../data/DataTree';
import { DataTypes } from '../../data/DataTypes';
import { InputManager } from '../../io/InputManager';
import { OutputManager } from '../../io/OutputManager';
import { Deg2Rad } from '../../math/Constant';
import { NMesh } from '../../math/geometry/mesh/NMesh';
import { ExporterNodeJSONType, ExporterNodeBase } from './ExporterNodeBase';

export type MeshExporterNodeJSONType = ExporterNodeJSONType & {
  coordinate?: string;
};

export abstract class MeshExporterNodeBase extends ExporterNodeBase {
  protected coordinate: string = 'left';
  protected abstract get binary(): boolean;

  public setupInspectorElement (container: HTMLDivElement): void {
    const inputTextId = 'mesh-exporter-label';
    const selectBoxId = 'mesh-exporter-coordinate';
    const buttonId = 'mesh-exporter-button';

    const html = `
      <ul>
        <li>
          <div class="">
            <label for='${inputTextId}'>File name</label>
            <input type='text' name='${inputTextId}' id='${inputTextId}' class='form-control input-block ${inputTextId}' />
          </div>
        </li>
        <li>
          <div class="">
            <label for='${selectBoxId}'>Coordinate system</label>
            <select name='${selectBoxId}' id='${selectBoxId}' class='form-select input-block ${selectBoxId}'>
              <option value='left'>left-handed</option>
              <option value='right'>right-handed</option>
            </select>
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

    const input = container.getElementsByClassName(inputTextId)[0] as HTMLInputElement;
    input.addEventListener('change', () => {
      this.fileName = input.value;
      this.notifyStateChanged();
    });
    input.value = this.fileName;

    const select = container.getElementsByClassName(selectBoxId)[0] as HTMLSelectElement;
    select.addEventListener('change', () => {
      this.coordinate = select.value;
    });
    select.value = this.coordinate;

    const button = container.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.download(input.value, select.value);
    });
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const buttonId = 'exporter-button';
    const html = `
      <button class='btn ${buttonId}' id='${buttonId}'></button>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const button = container.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.download(this.fileName, this.coordinate);
    });
    this.onStateChanged.on(() => {
      button.textContent = this.fileName;
    });
    button.textContent = this.fileName;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', `Mesh to export as ${this.format}`, DataTypes.MESH, AccessTypes.TREE);
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (access: DataAccess): void {
  }

  private async export (coordinate: string = 'right'): Promise<Blob> {
    const input = this.inputManager.getIO(0);
    const tree = input.getData() as DataTree;

    const container = new Object3D();

    tree.traverse((mesh: NMesh) => {
      const geometry = mesh.build();
      const m = new Mesh(geometry, new MeshStandardMaterial({
        color: new Color(0xC0C0C0),
        side: DoubleSide,
        roughness: 0.47,
        metalness: 0
      }));
      container.add(m);
    });

    switch (coordinate) {
      case 'right': {
        container.rotation.x = 90 * Deg2Rad;
        container.updateMatrixWorld(true);
        break;
      }
    }

    const data = await this.parse(container);
    return Promise.resolve(new Blob([data], {
      type: this.binary ? 'application/octet-binary' : 'text/plain'
    }));
  }

  protected abstract parse(container: Object3D): Promise<any>;

  private async download (name: string, coordinate: string): Promise<void> {
    const blob = await this.export(coordinate);

    const a = document.createElement('a');
    const e = document.createEvent('MouseEvent');
    const url = window.URL.createObjectURL(blob);

    a.download = name.includes(`.${this.format}`) ? name : `${name}.${this.format}`;
    a.href = url;

    e.initEvent('click', true, true);
    a.dispatchEvent(e);
  }

  public toJSON (name: string): MeshExporterNodeJSONType {
    const json = super.toJSON(name);
    return {
      ...json,
      ...{
        coordinate: this.coordinate
      }
    };
  }

  public fromJSON (json: MeshExporterNodeJSONType): void {
    this.coordinate = json.coordinate ?? 'left';
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
