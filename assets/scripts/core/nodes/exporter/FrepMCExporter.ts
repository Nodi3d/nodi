import { Object3D } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { AccessTypes } from '../../data/AccessTypes';
import DataAccess from '../../data/DataAccess';
import DataTree from '../../data/DataTree';
import { DataTypes } from '../../data/DataTypes';
import InputManager from '../../io/InputManager';
import OutputManager from '../../io/OutputManager';
import { Deg2Rad } from '../../math/Constant';
import NFrepMarchingCubes from '../../math/frep/misc/NFrepMarchingCubes';
import NFrep from '../../math/frep/NFrep';
import ExporterNodeBase, { ExporterNodeJSONType } from './ExporterNodeBase';
import IndicatorElement from '~/assets/scripts/core/dom/IndicatorElement';

export type FrepMeshExporterNodeJSONType = ExporterNodeJSONType & {
  format?: SupportedFormat;
  coordinate?: Coordinate;
  resolution?: number;
  padding?: number;
};

const SupportedFormats = {
  stl: 'stl',
  obj: 'obj',
  gltf: 'gltf',
  ply: 'ply'
} as const;
type SupportedFormat = typeof SupportedFormats[keyof typeof SupportedFormats];

const Coordinates = {
  left: 'left',
  right: 'right'
} as const;
type Coordinate = typeof Coordinates[keyof typeof Coordinates];

export default class FrepMCExporter extends ExporterNodeBase {
  protected fileName: string = 'frep';
  protected format: SupportedFormat = SupportedFormats.stl;
  private coordinate: Coordinate = Coordinates.left;

  public setupInspectorElement (container: HTMLDivElement): void {
    const inputTextId = 'mesh-exporter-label';
    const formatSelectBoxId = 'mesh-exporter-format';
    const coordinateSelectBoxId = 'mesh-exporter-coordinate';
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
            <label for='${formatSelectBoxId}'>Format</label>
            <select name='${formatSelectBoxId}' id='${formatSelectBoxId}' class='form-select input-block ${formatSelectBoxId}'>
              ${
                Object.keys(SupportedFormats).map((type) => {
                  return `<option value='${type}'>${type}</option>`;
                })
              }
            </select>
          </div>
        </li>
        <li>
          <div class="">
            <label for='${coordinateSelectBoxId}'>Coordinate system</label>
            <select name='${coordinateSelectBoxId}' id='${coordinateSelectBoxId}' class='form-select input-block ${coordinateSelectBoxId}'>
              ${
                Object.keys(Coordinates).map((coordinate) => {
                  return `<option value='${coordinate}'>${coordinate}-handed</option>`;
                })
              }
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

    const fSelect = container.getElementsByClassName(formatSelectBoxId)[0] as HTMLSelectElement;
    fSelect.addEventListener('change', () => {
      this.format = fSelect.value as SupportedFormat;
      this.notifyStateChanged();
    });

    const cSelect = container.getElementsByClassName(coordinateSelectBoxId)[0] as HTMLSelectElement;
    cSelect.addEventListener('change', () => {
      this.coordinate = cSelect.value as Coordinate;
      this.notifyStateChanged();
    });

    input.value = this.fileName;
    fSelect.value = this.format;
    cSelect.value = this.coordinate;

    const button = container.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    button.disabled = this.processing;
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      button.disabled = true;
      await this.download(input.value, this.format, this.coordinate);
      button.disabled = false;
    });
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const buttonWrapperId = 'button-wrapper';
    const buttonId = 'frep-exporter-button';
    const formatSelectBoxId = 'frep-exporter-format';
    const coordinateSelectBoxId = 'frep-exporter-coordinate';

    const html = `
      <div class='d-flex flex-column'>
        <div class='${buttonWrapperId}'>
          <button class='btn ${buttonId} mb-1' id='${buttonId}'></button>
        </div>
        <select style='width: 120px;' name='${formatSelectBoxId}' id='${formatSelectBoxId}' class='mb-1 ${formatSelectBoxId}'>
          ${
            Object.keys(SupportedFormats).map((type) => {
              return `<option value='${type}'>${type}</option>`;
            })
          }
        </select>
        <select style='width: 120px;' name='${coordinateSelectBoxId}' id='${coordinateSelectBoxId}' class='mb-1 ${coordinateSelectBoxId}'>
          ${
            Object.keys(Coordinates).map((coordinate) => {
              return `<option value='${coordinate}'>${coordinate}-handed</option>`;
            })
          }
        </select>
      </div>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const wrapper = container.getElementsByClassName(buttonWrapperId)[0] as HTMLDivElement;
    const indicator = new IndicatorElement();
    indicator.hide();
    wrapper.appendChild(indicator.dom);

    const fSelect = container.getElementsByClassName(formatSelectBoxId)[0] as HTMLSelectElement;
    fSelect.addEventListener('change', () => {
      this.format = fSelect.value as SupportedFormat;
    });

    const cSelect = container.getElementsByClassName(coordinateSelectBoxId)[0] as HTMLSelectElement;
    cSelect.addEventListener('change', () => {
      this.coordinate = cSelect.value as Coordinate;
    });

    const button = container.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      button.disabled = true;
      indicator.show();
      await this.download(this.fileName, this.format, this.coordinate);
      button.disabled = false;
      indicator.hide();
    });
    this.onStateChanged.on(() => {
      fSelect.value = this.format;
      cSelect.value = this.coordinate;
      button.textContent = this.getButtonTitle();
    });

    fSelect.value = this.format;
    cSelect.value = this.coordinate;
    button.textContent = this.getButtonTitle();
  }

  private getButtonTitle (): string {
    return this.fileName.includes(`.${this.format}`) ? this.fileName : `${this.fileName}.${this.format}`;
  }

  public get displayName (): string {
    return 'Frep MC Exporter';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'FRep to export as mesh', DataTypes.FREP, AccessTypes.ITEM);
    manager.add('r', 'Meshing resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([64]));
    manager.add('p', 'Meshing padding', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0]));
  }

  public registerOutputs (manager: OutputManager): void {
  }

  public solve (access: DataAccess): void {
  }

  private async export (name: string, format: SupportedFormat, coordinate: Coordinate = 'right'): Promise<void> {
    const frepTree = this.inputManager.getIO(0).getData() as DataTree;
    const resolutionTree = this.inputManager.getIO(1).getData() as DataTree;
    const paddingTree = this.inputManager.getIO(2).getData() as DataTree;

    const resolution = (resolutionTree.getItemsByIndex(0)[0] as number) || 64;
    const padding = (paddingTree.getItemsByIndex(0)[0] as number) || 0;

    const freps: NFrep[] = [];
    frepTree.traverse((frep: NFrep) => {
      freps.push(frep);
    });

    const mc = new NFrepMarchingCubes();
    const threshold = 128;
    if (resolution <= threshold) {
      const promises = freps.map((frep) => {
        return mc.execute(frep, resolution, padding);
      });
      const result = await Promise.all(promises);
      const container = new Object3D();
      result.forEach((r) => {
        mc.mesh(r.result, r.dw, resolution).forEach((m) => {
          container.add(m);
        });
      });
      const data = await this.parse(format, coordinate, container);
      this.downloadBlob(data, name, format);
    } else {
      for (let i = 0; i < freps.length; i++) {
        const frep = freps[i];
        const r = await mc.execute(frep, resolution, padding);
        const len = r.result.length;
        for (let j = 0; j < len; j++) {
          const item = r.result[j];
          const single = mc.mesh([item], r.dw, resolution)[0];
          const data = await this.parse(format, coordinate, single);
          const title = this.extractFileName(name);
          this.downloadBlob(data, `${title}-${i}-${len}-${j}`, format);
          single.geometry.dispose();
        }
      }
    }
  }

  private extractFileName (name: string): string {
    return name.includes('.') ? name.split('.')[0] : name;
  }

  private parse (format: SupportedFormat, coordinate: Coordinate, container: Object3D): Promise<any> {
    switch (coordinate) {
      case Coordinates.right: {
        container.rotation.x = 90 * Deg2Rad;
        container.updateMatrixWorld(true);
        break;
      }
    }

    return new Promise((resolve) => {
      switch (format) {
        case SupportedFormats.stl:
        {
          const result = new STLExporter().parse(container, {
            binary: false
          });
          resolve(result);
          break;
        }
        case SupportedFormats.obj:
        {
          const result = new OBJExporter().parse(container);
          resolve(result);
          break;
        }
        case SupportedFormats.gltf:
        {
          new GLTFExporter().parse(container, (result) => {
            resolve(result);
          }, {
            binary: true
          });
          break;
        }
        case SupportedFormats.ply:
        {
          const result = new PLYExporter().parse(container, () => {}, {
            binary: false
          });
          resolve(result);
          break;
        }
      }
    });
  }

  private async download (name: string, format: SupportedFormat, coordinate: Coordinate): Promise<void> {
    this.processing = true;
    await this.export(name, format, coordinate);
    this.processing = false;
  }

  private downloadBlob (data: any, name: string, format: SupportedFormat): void {
    const binary = format === SupportedFormats.gltf;
    const blob = new Blob([data], {
      type: binary ? 'application/octet-binary' : 'text/plain'
    });
    const a = document.createElement('a');
    const e = document.createEvent('MouseEvent');
    const url = window.URL.createObjectURL(blob);
    a.download = name.includes(`.${this.format}`) ? name : `${name}.${this.format}`;
    a.href = url;
    e.initEvent('click', true, true);
    a.dispatchEvent(e);
  }

  public toJSON (): FrepMeshExporterNodeJSONType {
    const json = super.toJSON();
    return {
      ...json,
      ...{
        coordinate: this.coordinate,
        format: this.format
      }
    };
  }

  public fromJSON (json: FrepMeshExporterNodeJSONType): void {
    this.coordinate = json.coordinate ?? Coordinates.left;
    this.format = json.format ?? SupportedFormats.stl;
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
