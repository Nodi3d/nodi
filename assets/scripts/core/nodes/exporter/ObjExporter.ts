
import { Object3D } from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import MeshExporterNodeBase from './MeshExporterNodeBase';

export default class ObjExporter extends MeshExporterNodeBase {
  protected fileName: string = 'default.obj';

  protected get binary (): boolean {
    return false;
  }

  protected get format (): string {
    return 'obj';
  }

  protected parse (container: Object3D): Promise<any> {
    return new Promise((resolve) => {
      const result = new OBJExporter().parse(container);
      resolve(result);
    });
  }

  get displayName (): string {
    return '.obj';
  }
}
