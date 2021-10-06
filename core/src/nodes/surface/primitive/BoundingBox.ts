
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { IBoundable, isBoundable } from '../../../math/geometry/IBoundable';
import { NPlane } from '../../../math/geometry/NPlane';
import { NodeJSONType, NodeBase } from '../../NodeBase';

export type BoundingBoxJSONType = NodeJSONType & {
  union?: boolean;
};

export class BoundingBox extends NodeBase {
  private get union (): boolean {
    return this._union;
  }

  private set union (value: boolean) {
    this._union = value;
    this.inputManager.getIO(0).setAccessType(this.union ? AccessTypes.LIST : AccessTypes.ITEM);
    this.notifyValueChanged();
  }

  private _union: boolean = false;

  get displayName (): string {
    return 'BBox';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Geometry to contain', DataTypes.CURVE | DataTypes.MESH, this.union ? AccessTypes.LIST : AccessTypes.ITEM);
    manager.add('p', 'BoundingBox orientation plane', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('b', 'Aligned bounding box in world coordinates', DataTypes.BOX, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const plane = access.getData(1);

    if (this.union) {
      const geometries = access.getDataList(0) as IBoundable[];
      const n = geometries.length;
      if (n > 0) {
        const bb = geometries[0].bounds(plane);
        for (let i = 1; i < n; i++) {
          const other = geometries[i].bounds(plane);
          bb.encapsulate(other);
        }
        access.setData(0, bb);
      }
    } else {
      const geom = access.getData(0);
      if (isBoundable(geom)) {
        const bb = geom.bounds(plane);
        access.setData(0, bb);
      }
    }
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const boundingBoxUnionId = 'bounding-box-union';

    const html = `
      <ul>
        <li class='px-0'>
          <div class="">
            <label for='${boundingBoxUnionId}'>union</label>
            <input type='checkbox' name='${boundingBoxUnionId}' id='${boundingBoxUnionId}' class='form-control ${boundingBoxUnionId}' />
          </div>
        </li>
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const unionCheckbox = container.getElementsByClassName(boundingBoxUnionId)[0] as HTMLInputElement;
    unionCheckbox.addEventListener('change', (e: Event) => {
      const input = e.target as HTMLInputElement;
      this.union = input.checked;
    });
    unionCheckbox.checked = this.union;
  }

  public toJSON (name: string): BoundingBoxJSONType {
    return {
      ...super.toJSON(name),
      ...{
        union: this.union
      }
    };
  }

  public fromJSON (json: BoundingBoxJSONType) {
    super.fromJSON(json);
    this.union = json.union ?? this.union;
  }
}
