import { BufferGeometry, Color, DoubleSide, FrontSide, Material, Mesh, MeshStandardMaterial, RawShaderMaterial, Side } from 'three';
import NodeBase from '../../core/nodes/NodeBase';
import { RenderingMode } from '../misc/RenderingMode';

import NormalVert from '../shaders/mesh/Normal.vert';
import NormalFrag from '../shaders/mesh/Normal.frag';
import TransparentFrag from '../shaders/mesh/Transparent.frag';
import { IElementable } from '../../core/misc/IElementable';
import IRenderingModeResponsible from '../misc/IRenderingModeResponsible';
import IDisposable from '../../core/misc/IDisposable';

const defaultStandardColor = new Color(0xC0C0C0);
const selectedStandardColor = new Color(0x27DE60);

type MaterialDictionary<T extends string | symbol | number> = {
  [K in T]: Material;
};

export default class NVMesh extends Mesh implements IElementable, IRenderingModeResponsible {
  public node: string;
  public materials: MaterialDictionary<RenderingMode>;
  private _listener?: IDisposable;

  constructor (geometry: BufferGeometry, mode: RenderingMode = RenderingMode.Normal, side: Side = DoubleSide) {
    const materials: MaterialDictionary<RenderingMode> = {
      [RenderingMode.Standard]: new MeshStandardMaterial({
        color: defaultStandardColor,
        side,
        roughness: 0.47,
        metalness: 0.0,
        depthTest: true,
        depthWrite: true
      }),
      [RenderingMode.Normal]: new RawShaderMaterial({
        vertexShader: NormalVert,
        fragmentShader: NormalFrag,
        side: FrontSide,
        uniforms: {
          selected: {
            value: false
          },
          color: {
            value: new Color(0x27DE60)
          }
        },
        depthTest: true,
        depthWrite: true,
        clipping: true
      }),
      [RenderingMode.Transparent]: new RawShaderMaterial({
        vertexShader: NormalVert,
        fragmentShader: TransparentFrag,
        side: DoubleSide,
        uniforms: {
          selected: {
            value: false
          },
          normalColor: {
            value: new Color(0xEB5757)
          },
          selectedColor: {
            value: new Color(0x27DE60)
          },
          opacity: {
            value: 0.5
          }
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        alphaTest: 0,
        clipping: true
      }),
      [RenderingMode.Wireframe]: new RawShaderMaterial({
        vertexShader: NormalVert,
        fragmentShader: TransparentFrag,
        side: DoubleSide,
        uniforms: {
          selected: {
            value: false
          },
          normalColor: {
            value: new Color(0xEB5757)
          },
          selectedColor: {
            value: new Color(0x27DE60)
          },
          opacity: {
            value: 0.8
          }
        },
        wireframe: true,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        alphaTest: 0,
        clipping: true
      })
    };

    super(geometry, materials[mode]);
    this.node = '';
    this.castShadow = true;
    this.receiveShadow = true;
    this.materials = materials;
  }

  public setRenderingMode (mode: RenderingMode): void {
    this.material = this.materials[mode];
  }

  public setup (node: NodeBase): void {
    this.node = node.uuid;
    this.visible = node.visible;
    this._listener?.dispose();
    this._listener = node.onStateChanged.on((e) => {
      const n = e.node;
      this.visible = n.visible;
      this.select(n);
    });
    this.select(node);
  }

  public select (node: NodeBase): void {
    // const material = (this.material as LineMaterial);
    // material.color = new Color(node.selected ? 0x00FF00 : 0xFF0000);
    if (this.material === this.materials[RenderingMode.Standard]) {
      (this.material as MeshStandardMaterial).color = node.selected ? selectedStandardColor : defaultStandardColor;
    } else {
      (this.material as RawShaderMaterial).depthTest = !node.selected;
    }
    this.renderOrder = node.selected ? 10000 : 0;
  }

  public dispose (): void {
    this._listener?.dispose();
    this.geometry.dispose();
  }
}
