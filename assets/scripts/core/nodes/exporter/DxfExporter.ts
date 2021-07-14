
import Drawing, { Unit, ACIKey } from 'dxf-writer';
import { Vector3 } from 'three';
import { AccessTypes } from '../../data/AccessTypes';
import DataAccess from '../../data/DataAccess';
import { DataTypes } from '../../data/DataTypes';
import InputManager from '../../io/InputManager';
import OutputManager from '../../io/OutputManager';
import NCurve from '../../math/geometry/curve/NCurve';

import NPolylineCurve from '../../math/geometry/curve/NPolylineCurve';
import NPlane from '../../math/geometry/NPlane';
import DataTree from '../../data/DataTree';
import ExporterNodeBase, { ExporterNodeJSONType } from './ExporterNodeBase';

export type DxfExporterJSONType = ExporterNodeJSONType & {
  dxfUnits?: string;
  dxfResolution?: number;
};

export default class DxfExporter extends ExporterNodeBase {
  protected fileName: string = 'default.dxf';
  private dxfUnits: string = 'Millimeters';
  private dxfResolution: number = 64;

  get format (): string {
    return 'dxf';
  }

  get displayName (): string {
    return '.dxf';
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const fileNameId = 'dxf-exporter-label';
    const selectBoxId = 'dxf-exporter-coordinate';
    const resolutionId = 'dxf-exporter-resolution';
    const buttonId = 'dxf-exporter-button';

    const html = `
      <ul>
        <li>
          <div class="">
            <label for='${fileNameId}'>File name</label>
            <input type='text' name='${fileNameId}' id='${fileNameId}' class='form-control input-block ${fileNameId}' />
          </div>
        </li>
        <li>
          <div class="">
            <label for='${selectBoxId}'>Units</label>
            <select name='${selectBoxId}' id='${selectBoxId}' class='form-select input-block ${selectBoxId}'>
              <option value='Unitless'>Unitless</option>
              <option value='Millimeters'>Millimeters</option>
              <option value='Centimeters'>Centimeters</option>
              <option value='Meters'>Meters</option>
              <option value='Inches'>Inches</option>
              <option value='Feet'>Feet</option>
              <option value='Miles'>Miles</option>
            </select>
          </div>
        </li>
        <li>
          <div class="">
            <label for='${resolutionId}'>Resolution (for parametric curve division)</label>
            <input type='number' name='${resolutionId}' id='${resolutionId}' class='form-control input-block ${resolutionId}' min='4' max='4096' value='64' />
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
    input.addEventListener('change', () => {
      this.fileName = input.value;
      this.notifyStateChanged();
    });
    input.value = this.fileName;

    const select = container.getElementsByClassName(selectBoxId)[0] as HTMLSelectElement;
    select.addEventListener('change', () => {
      this.dxfUnits = select.value;
    });
    select.value = this.dxfUnits;

    const resolution = container.getElementsByClassName(resolutionId)[0] as HTMLInputElement;
    resolution.addEventListener('change', () => {
      this.dxfResolution = Number(resolution.value);
    });
    resolution.value = this.dxfResolution.toString();

    const button = container.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.download(input.value, select.value as Unit, Number(resolution.value));
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

      this.download(this.fileName, this.dxfUnits as Unit, this.dxfResolution);
    });
    button.textContent = this.fileName;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curves to export as dxf', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('p', 'Plane to project curves', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (access: DataAccess): void {
  }

  private export (unit: Unit = 'Millimeters', resolution: number = 64): Promise<Blob> {
    const drawing = new Drawing();
    drawing.setUnits(unit);

    let layer = 0;
    const colors = Object.keys(Drawing.ACI) as ACIKey[];

    const input = this.inputManager.getIO(0);
    const tree = input.getData() as DataTree;

    const planeTree = this.inputManager.getIO(1).getData() as DataTree;
    const plane = planeTree.getItemsByIndex(0)[0] as NPlane;

    tree.traverse((curve: NCurve) => {
      let points: Vector3[] = [];

      if (curve instanceof NPolylineCurve) {
        points = curve.points;
        if (curve.closed && points.length > 0) {
          points.push(points[0]);
        }
      } else {
        points = curve.getPoints(resolution);
      }

      const projected = points.map((p) => {
        const v = plane.project(p);
        return v.toArray();
      });

      if (projected.length > 0) {
        const key = `l_${layer++}`;
        const aci = colors[layer % colors.length];
        const color = Drawing.ACI[aci];

        // line types: CONTINUOUS, DASHED, DOTTED
        drawing.addLayer(key, color, 'DOTTED').setActiveLayer(key);
        drawing.drawPolyline(projected);
      }
    });

    const data = drawing.toDxfString();
    return Promise.resolve(new Blob([data], {
      type: 'text/plain'
    }));
  }

  private async download (name: string, unit: Unit, resolution: number): Promise<void> {
    const blob = await this.export(unit, resolution);

    const a = document.createElement('a');
    const e = document.createEvent('MouseEvent');
    const url = window.URL.createObjectURL(blob);

    a.download = name.includes(`.${this.format}`) ? name : `${name}.${this.format}`;
    a.href = url;

    e.initEvent('click', true, true);
    a.dispatchEvent(e);
  }

  public toJSON (): DxfExporterJSONType {
    const json = super.toJSON();
    return {
      ...json,
      ...{
        dxfUnits: this.dxfUnits,
        dxfResolution: this.dxfResolution
      }
    };
  }

  public fromJSON (json: DxfExporterJSONType): void {
    this.dxfUnits = json.dxfUnits ?? this.dxfUnits;
    this.dxfResolution = json.dxfResolution ?? this.dxfResolution;
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
