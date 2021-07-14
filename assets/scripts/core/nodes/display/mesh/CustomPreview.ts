import { DoubleSide, Mesh, MeshStandardMaterial, RepeatWrapping, Texture, TextureLoader, Vector2 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import DataAccess from '../../../data/DataAccess';
import DataAccessor from '../../../data/DataAccessor';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import NMesh from '../../../math/geometry/mesh/NMesh';
import { IElementable } from '../../../misc/IElementable';
import IDisplayNode from '../../IDisplayNode';
import NodeBase, { NodeJSONType } from '../../NodeBase';
import { TypedEvent } from '../../../misc/TypedEvent';
import IImporterNode, { ImportFileArg } from '../../IImporterNode';
import NVCustomMesh from '~/assets/scripts/viewer/elements/NVCustomMesh';

type CustomPreviewTextureType = {
  name: string;
  url: string;
  scale: { x: number; y: number };
};

export type CustomPreviewJSONType = NodeJSONType & {
  color?: string;
  emission?: string;
  roughness?: number;
  metalness?: number;
  albedo?: CustomPreviewTextureType;
  normal?: CustomPreviewTextureType;
};

export default class CustomPreview extends NodeBase implements IDisplayNode, IImporterNode {
  onImportFile: TypedEvent<ImportFileArg> = new TypedEvent();
  private onTextureChanged: TypedEvent<{ node: CustomPreview }> = new TypedEvent();

  color: string = '#ffffff';
  emission: string = '#000000';
  roughness: number = 0.47;
  metalness: number = 0.0;
  albedo: CustomPreviewTextureType = { name: '', url: '', scale: new Vector2(1, 1) };
  normal: CustomPreviewTextureType = { name: '', url: '', scale: new Vector2(1, 1) };

  private albedoMap?: Texture;
  private normalMap?: Texture;

  constructor (uuid: string) {
    super(uuid);

    this.onTextureChanged.on(() => {
      if (this.albedoMap !== undefined) { this.albedoMap.dispose(); }
      if (this.normalMap !== undefined) { this.normalMap.dispose(); }

      const loader = new TextureLoader();
      this.albedoMap = loader.load(this.albedo.url);
      this.normalMap = loader.load(this.normal.url);
      this.albedoMap.wrapS = this.normalMap.wrapS = RepeatWrapping;
      this.albedoMap.wrapT = this.normalMap.wrapT = RepeatWrapping;
    });
  }

  public get displayName (): string {
    return 'Custom Preview';
  }

  public get previewable (): true {
    return true;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('m', 'Mesh to preview', DataTypes.MESH, AccessTypes.ITEM);
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (_access: DataAccess): void {
  }

  public setupInspectorElement (container: HTMLDivElement): void {
    const colorId = 'custom-preview-color';
    const emissionId = 'custom-preview-emission';
    const roughnessId = 'custom-preview-roughness';
    const metalnessId = 'custom-preview-metalness';
    const importAlbedoButtonId = 'custom-preview-albedo-texture';
    const importNormalButtonId = 'custom-preview-normal-texture';
    const html = `
      <ul>
        <li>
          <div>
            <label for='${colorId}'>color</label>
            <input type='color' name='${colorId}' id='${colorId}' class='form-control input-block ${colorId}' />
          </div>
        </li>
        <li>
          <div>
            <label for='${emissionId}'>emission</label>
            <input type='color' name='${emissionId}' id='${emissionId}' class='form-control input-block ${emissionId}' />
          </div>
        </li>
        <li>
          <div>
            <label for='${roughnessId}'>roughness</label>
            <input type='range' min='0.0' max='1.0' step='0.01' name='${roughnessId}' id='${roughnessId}' class='form-control input-block ${roughnessId} my-0' />
          </div>
        </li>
        <li>
          <div>
            <label for='${metalnessId}'>metalness</label>
            <input type='range' min='0.0' max='1.0' step='0.01' name='${metalnessId}' id='${metalnessId}' class='form-control input-block ${metalnessId} my-0' />
          </div>
        </li>
        <li class='px-0'>
          <div>
            <button class='btn btn-block rounded-0 dark-theme ${importAlbedoButtonId}' id='${importAlbedoButtonId}'>import albedo texture</button>
          </div>
        </li>
        <li class='px-0'>
          <div>
            <button class='btn btn-block rounded-0 dark-theme ${importNormalButtonId}' id='${importNormalButtonId}'>import normal texture</button>
          </div>
        </li>
      </ul>
    `;
    const template = document.createElement('template');
    template.innerHTML = html;
    container.appendChild(template.content);

    const colorHandler = (e: Event) => {
      this.color = (e.target as HTMLInputElement).value;
      this.onStateChanged.emit({ node: this });
    };
    const colorInput = container.getElementsByClassName(colorId)[0] as HTMLInputElement;
    colorInput.value = this.color;
    colorInput.addEventListener('input', colorHandler);
    colorInput.addEventListener('change', colorHandler);

    const emissionHandler = (e: Event) => {
      this.emission = (e.target as HTMLInputElement).value;
      this.onStateChanged.emit({ node: this });
    };
    const emissionInput = container.getElementsByClassName(emissionId)[0] as HTMLInputElement;
    emissionInput.value = this.emission;
    emissionInput.addEventListener('input', emissionHandler);
    emissionInput.addEventListener('change', emissionHandler);

    const roughnessHandler = (e: Event) => {
      this.roughness = Number((e.target as HTMLInputElement).value);
      this.onStateChanged.emit({ node: this });
    };
    const roughnessInput = container.getElementsByClassName(roughnessId)[0] as HTMLInputElement;
    roughnessInput.value = this.roughness.toString();
    roughnessInput.addEventListener('input', roughnessHandler);
    roughnessInput.addEventListener('change', roughnessHandler);
    roughnessInput.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
    });

    const metalnessHandler = (e: Event) => {
      this.roughness = Number((e.target as HTMLInputElement).value);
      this.onStateChanged.emit({ node: this });
    };
    const metalnessInput = container.getElementsByClassName(metalnessId)[0] as HTMLInputElement;
    metalnessInput.value = this.metalness.toString();
    metalnessInput.addEventListener('input', metalnessHandler);
    metalnessInput.addEventListener('change', metalnessHandler);
    metalnessInput.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
    });

    const importAlbedoButton = container.getElementsByClassName(importAlbedoButtonId)[0] as HTMLButtonElement;
    importAlbedoButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.import('albedo');
    });
    this.onStateChanged.on(() => {
      importAlbedoButton.disabled = this.processing;
    });

    const importNormalButton = container.getElementsByClassName(importNormalButtonId)[0] as HTMLButtonElement;
    importNormalButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.import('normal');
    });
    this.onStateChanged.on(() => {
      importNormalButton.disabled = this.processing;
    });
  }

  display (): IElementable[] {
    const da = new DataAccessor(this.inputManager, this.outputManager);
    const count = da.getInCount();

    const elements: IElementable[] = [];
    for (let i = 0; i < count; i++) {
      da.iterate(this, i, (_, access) => {
        const mesh = access.getData(0) as NMesh;
        const geometry = mesh.build();
        const material = new MeshStandardMaterial({
          side: DoubleSide,
          color: this.color,
          emissive: this.emission,
          roughness: this.roughness,
          metalness: this.metalness,
          depthTest: true,
          depthWrite: true
        });
        if (this.albedoMap !== undefined) { material.map = this.albedoMap; }
        if (this.normalMap !== undefined) { material.normalMap = this.normalMap; }
        const m = new NVCustomMesh(geometry, material);
        elements.push(m);
      });
    }

    return elements;
  }

  protected import (key: string): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.JPG,.jpeg,.JPEG,.png,.PNG';
    input.onchange = (evt: Event) => {
      const input = evt.target as HTMLInputElement;
      const files = input.files as FileList;
      if (files.length > 0) {
        this.read(key, files[0]);
      }
    };
    input.click();
  }

  protected read (key: string, file: File): void {
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
          blob, key, name: file.name, folder: 'preview'
        });
      }
    });
    reader.readAsArrayBuffer(file);
  }

  registerFile (key: 'albedo' | 'normal', name: string, url: string): void {
    this[key].name = name;
    this[key].url = url;
    this.onTextureChanged.emit({ node: this });
    this.notifyValueChanged();
  }

  toJSON (): CustomPreviewJSONType {
    return {
      ...super.toJSON(),
      ...{
        color: this.color,
        emission: this.emission,
        roughness: this.roughness,
        metalness: this.metalness,
        albedo: this.albedo,
        normal: this.normal
      }
    };
  }

  fromJSON (json: CustomPreviewJSONType) {
    this.color = json.color ?? this.color;
    this.emission = json.emission ?? this.emission;
    this.roughness = json.roughness ?? this.roughness;
    this.metalness = json.metalness ?? this.metalness;
    this.albedo = json.albedo ?? this.albedo;
    this.normal = json.normal ?? this.normal;
    this.onTextureChanged.emit({ node: this });
    super.fromJSON(json);
  }
}
