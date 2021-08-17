
import { Object3D } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import MeshExporterNodeBase from './MeshExporterNodeBase';

export default class GltfExporter extends MeshExporterNodeBase {
  protected fileName: string = 'default.glb';

  protected get binary (): boolean {
    return true;
  }

  protected get format (): string {
    return 'glb';
  }

  protected parse (container: Object3D): Promise<any> {
    return new Promise((resolve) => {
      new GLTFExporter().parse(container, (result) => {
        resolve(result);
      }, {
        binary: true
      });
    });
  }

  get displayName (): string {
    return '.glb';
  }
}
