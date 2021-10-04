
import Drawing, { Unit, ACIKey } from 'dxf-writer';
import { Vector3 } from 'three';
import { AccessTypes } from '../../data/AccessTypes';
import { DataAccess } from '../../data/DataAccess';
import { DataTypes } from '../../data/DataTypes';
import { InputManager } from '../../io/InputManager';
import { OutputManager } from '../../io/OutputManager';
import { NCurve } from '../../math/geometry/curve/NCurve';

import { NPolylineCurve } from '../../math/geometry/curve/NPolylineCurve';
import { NPlane } from '../../math/geometry/NPlane';
import { DataTree } from '../../data/DataTree';
import { ExporterNodeJSONType, ExporterNodeBase } from './ExporterNodeBase';

export type DxfExporterJSONType = ExporterNodeJSONType & {
  dxfUnits?: string;
};

export class DxfExporter extends ExporterNodeBase {
  protected fileName: string = 'default.dxf';
  private dxfUnits: string = 'Millimeters';

  get format (): string {
    return 'dxf';
  }

  get displayName (): string {
    return '.dxf';
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const fileNameId = 'dxf-exporter-label';
    const selectBoxId = 'dxf-exporter-coordinate';
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

    const button = container.getElementsByClassName(buttonId)[0] as HTMLButtonElement;
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.download(input.value, select.value as Unit);
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

      this.download(this.fileName, this.dxfUnits as Unit);
    });
    button.textContent = this.fileName;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Curves to export as dxf', DataTypes.CURVE, AccessTypes.LIST);
    manager.add('p', 'Plane to project curves', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('r', 'Polyline resolution', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([128]));
    manager.add('w', 'Curve width in dxf', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (access: DataAccess): void {
  }

  private export (unit: Unit = 'Millimeters'): Promise<Blob> {
    const drawing = new Drawing();
    drawing.setUnits(unit);

    const colors = Object.keys(Drawing.ACI) as ACIKey[];

    const curveTree = this.inputManager.getIO(0).getData() as DataTree;
    const planeTree = this.inputManager.getIO(1).getData() as DataTree;
    const resolutionTree = this.inputManager.getIO(2).getData() as DataTree;
    const widthTree = this.inputManager.getIO(3).getData() as DataTree;

    const plane = planeTree.getItemsByIndex(0)[0] as NPlane;
    const resolution = resolutionTree.getItemsByIndex(0)[0] as number;
    const width = widthTree.getItemsByIndex(0)[0] as number;

    let index = 0;
    curveTree.traverse((curve: NCurve) => {
      let points: Vector3[] = [];

      if (curve instanceof NPolylineCurve) {
        points = curve.points;
      } else {
        points = curve.getPoints(resolution);
      }

      const projected = points.map((p) => {
        const v = plane.project(p);
        return v.toArray();
      });

      if (projected.length > 0) {
        const key = `l_${index++}`;
        const aci = colors[index % colors.length];
        const color = Drawing.ACI[aci];

        // line types: CONTINUOUS, DASHED, DOTTED
        const layer = drawing.addLayer(key, color, 'CONTINUOUS').setActiveLayer(key);
        layer.drawPolyline(projected, curve.closed, width, width);
      }
    });

    const data = drawing.toDxfString();
    return Promise.resolve(new Blob([data], {
      type: 'text/plain'
    }));
  }

  private async download (name: string, unit: Unit): Promise<void> {
    const blob = await this.export(unit);

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
        dxfUnits: this.dxfUnits
      }
    };
  }

  public fromJSON (json: DxfExporterJSONType): void {
    this.dxfUnits = json.dxfUnits ?? this.dxfUnits;
    this.notifyValueChanged();
    super.fromJSON(json);
  }
}
