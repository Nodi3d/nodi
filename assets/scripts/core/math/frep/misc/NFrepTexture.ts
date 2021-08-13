import { RGBAFormat, Texture, DataTexture, UnsignedByteType, WebGLRenderer, RenderTarget, WebGLRenderTarget, Vector3 } from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import NFrepBase from '../NFrepBase';
import FrepCommon from '../../../shaders/frep_common.glsl';
import FrepTextureFragment from '../shaders/frep_texture.frag';

export default class NFrepTexture {
  private renderer: WebGLRenderer;

  constructor (source?: WebGLRenderer) {
    this.renderer = source !== undefined ? source : new WebGLRenderer();
  }

  public render (frep: NFrepBase, boundingBox: { min: Vector3; max: Vector3; }, w: number, h: number, d: number): RenderTarget {
    const code = frep.compile('p');
    const { min, max } = boundingBox;

    const tw = w * h;
    const th = d;
    const gpuCompute = new GPUComputationRenderer(tw, th, this.renderer);
    gpuCompute.setDataType(UnsignedByteType);

    // const initialValueTexture = new DataTexture(new Uint8Array(tw * th * 4), tw, th, RGBAFormat, UnsignedByteType);
    const initialValueTexture = new Texture();
    initialValueTexture.format = RGBAFormat;
    initialValueTexture.type = UnsignedByteType;

    const variable = gpuCompute.addVariable(
      'textureFrep',
      FrepTextureFragment.replace(
        '#include <frep_common>',
        FrepCommon
      ),
      initialValueTexture
    );
    variable.material.uniforms.bmin = { value: min };
    variable.material.uniforms.bmax = { value: max };
    variable.material.uniforms.bsize = { value: max.clone().sub(min) };
    variable.material.uniforms.width = { value: w };
    variable.material.uniforms.height = { value: h };
    variable.material.uniforms.depth = { value: d };
    variable.material.uniforms.iwidth = { value: 1 / w };
    variable.material.uniforms.iheight = { value: 1 / h };
    variable.material.uniforms.idepth = { value: 1 / d };
    variable.material.defines.SCENE_CODE = code;

    gpuCompute.setVariableDependencies(variable, [variable]);
    const error = gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }
    gpuCompute.compute();

    return gpuCompute.getCurrentRenderTarget(variable);
  }

  public build (frep: NFrepBase, boundingBox: { min: Vector3; max: Vector3; }, w: number, h: number, d: number): Uint8Array {
    const target = this.render(frep, boundingBox, w, h, d) as WebGLRenderTarget;

    const { width, height } = target;
    const wh = width * height;
    const buffer = new Uint8Array(wh * 4);

    this.renderer.readRenderTargetPixels(target, 0, 0, width, height, buffer);

    const dst = new Uint8Array(wh);
    for (let i = 0; i < wh; i++) {
      dst[i] = buffer[i * 4];
    }
    return dst;
  }
}
