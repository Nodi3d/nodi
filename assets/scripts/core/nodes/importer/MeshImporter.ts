import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { Mesh } from 'three';
import { AccessTypes } from '../../data/AccessTypes';
import DataAccess from '../../data/DataAccess';
import { DataTypes } from '../../data/DataTypes';
import OutputManager from '../../io/OutputManager';
import NMesh from '../../math/geometry/mesh/NMesh';
import ImporterNodeBase from './ImporterNodeBase';

export default class MeshImporter extends ImporterNodeBase {
  public get displayName (): string {
    return 'Mesh Importer';
  }

  protected get folder (): string {
    return 'models';
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Imported mesh', DataTypes.MESH, AccessTypes.LIST);
  }

  public async solve (access: DataAccess): Promise<void> {
    if (this.fileUrl.length > 0) {
      const meshes = await this.loadFile(this.fileUrl);
      access.setDataList(0, meshes);
    } else {
      access.setDataList(0, []);
    }
    return Promise.resolve();
  }

  protected import (): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.obj,.OBJ,.stl,.STL,.gltf,.GLTF,.glb,.GLB,.ply,.PLY';
    input.onchange = (evt: Event) => {
      const input = evt.target as HTMLInputElement;
      const files = input.files as FileList;
      if (files.length > 0) {
        this.read(files[0]);
      }
    };
    input.click();
  }

  private loadFile (url: string): Promise<NMesh[]> {
    const separated = url.split('/');
    const last = separated[separated.length - 1];
    const arr = last.split('?');
    const name = arr[0];
    const q = name.split('.');
    const ext = q[q.length - 1];

    return new Promise((resolve, reject) => {
      switch (ext) {
        case 'obj':
        case 'OBJ': {
          const objLoader = new OBJLoader();
          objLoader.load(
            url,
            (result) => {
              const geometries: NMesh[] = [];
              result.traverse((object) => {
                if (object instanceof Mesh) {
                  const g = object.geometry;
                  geometries.push(NMesh.fromBufferGeometry(g));
                }
              });
              resolve(geometries);
            },
            (progress) => {},
            (error) => {
              // console.warn(error);
              reject(error);
            }
          );
          break;
        }
        case 'stl':
        case 'STL': {
          const stlLoader = new STLLoader();
          stlLoader.load(
            url,
            (buffer) => {
              const mesh = NMesh.fromBufferGeometry(buffer);
              resolve([mesh]);
            },
            (progress) => {},
            (error) => {
              // console.warn(error);
              reject(error);
            }
          );
          break;
        }
        case 'glb':
        case 'GLB':
        case 'gltf':
        case 'GLTF': {
          const gltfLoader = new GLTFLoader();
          gltfLoader.load(
            url,
            (result) => {
              const geometries: NMesh[] = [];
              result.scenes.forEach((scene) => {
                scene.traverse((object) => {
                  if (object instanceof Mesh) {
                    geometries.push(NMesh.fromBufferGeometry(object.geometry));
                  }
                });
              });
              resolve(geometries);
            },
            (progress) => {},
            (error) => {
              // console.warn(error);
              reject(error);
            }
          );
          break;
        }

        case 'ply':
        case 'PLY': {
          const plyLoader = new PLYLoader();
          plyLoader.load(
            url,
            (buffer) => {
              const mesh = NMesh.fromBufferGeometry(buffer);
              mesh.computeVertexNormals();
              resolve([mesh]);
            },
            (progress) => {},
            (error) => {
              // console.warn(error);
              reject(error);
            }
          );
          break;
        }
        default:
          reject(new Error(`${ext} format is not allowed`));
          break;
      }
    });
  }
}
