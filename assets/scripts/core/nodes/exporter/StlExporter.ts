
import { Object3D } from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import MeshExporterNodeBase from './MeshExporterNodeBase';

export default class StlExporter extends MeshExporterNodeBase {
  protected fileName: string = 'default.stl';

  protected get binary (): boolean {
    return false;
  }

  protected get format (): string {
    return 'stl';
  }

  protected parse (container: Object3D): Promise<any> {
    return new Promise((resolve) => {
      const result = new STLExporter().parse(container, {
        binary: false
      });
      resolve(result);
    });
  }

  get displayName (): string {
    return '.stl';
  }
}
