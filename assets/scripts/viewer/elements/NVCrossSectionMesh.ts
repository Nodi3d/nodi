
import { BackSide, BufferGeometry, Color, Mesh, RawShaderMaterial } from 'three';
import NormalVert from '../shaders/mesh/Normal.vert';
import CrossSectionFrag from '../shaders/mesh/CrossSection.frag';
import { IElementable } from '../../core/misc/IElementable';
import NodeBase from '../../core/nodes/NodeBase';
import IRenderingModeResponsible from '../misc/IRenderingModeResponsible';
import { RenderingMode } from '../misc/RenderingMode';

export default class NVCrossSectionMesh extends Mesh implements IElementable, IRenderingModeResponsible {
  node: string;

  constructor (geometry: BufferGeometry) {
    const crossSectionMaterial = new RawShaderMaterial({
      vertexShader: NormalVert,
      fragmentShader: CrossSectionFrag,
      side: BackSide,
      uniforms: {
        sectionColor: {
          value: new Color(0xEB5757)
        }
      },
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -4.0,
      clipping: true
    });

    super(
      geometry,
      crossSectionMaterial
    );

    this.node = '';
    this.castShadow = this.receiveShadow = false;
  }

  setRenderingMode (mode: RenderingMode): void {
    switch (mode) {
      case RenderingMode.Transparent:
      case RenderingMode.Wireframe:
      {
        this.visible = false;
        break;
      }
      default: {
        this.visible = true;
        break;
      }
    }
  }

  setup (node: NodeBase): void {
    this.node = node.uuid;
  }

  select (_node: NodeBase): void {
  }

  dispose (): void {
  }
}
