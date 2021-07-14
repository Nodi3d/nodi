
import { Object3D } from 'three';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter';
import MeshExporterNodeBase from './MeshExporterNodeBase';

export default class PlyExporter extends MeshExporterNodeBase {
  protected fileName: string = 'default.ply';

  protected get binary (): boolean {
    return true;
  }

  protected get format (): string {
    return 'ply';
  }

  protected parse (container: Object3D): Promise<any> {
    return new Promise((resolve) => {
      const result = new PLYExporter().parse(container, () => {}, {
        binary: false
      });
      resolve(result);
    });
  }

  get displayName (): string {
    return '.ply';
  }
}
