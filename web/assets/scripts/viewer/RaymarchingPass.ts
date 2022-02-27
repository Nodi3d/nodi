import { Color, DoubleSide, MeshDepthMaterial, NearestFilter, NoBlending, OrthographicCamera, RGBADepthPacking, Scene, ShaderMaterial, Texture, UniformsUtils, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { PreviewColors, NVFrep, FrepRenderingQuality, isFrepCustomFunction } from '@nodi/core';

import FrepCommon from './shaders/FrepCommon.glsl';
import QuadVertexShader from './shaders/Quad.vert';
import RaymarchingFragmentShader from './shaders/Raymarching.frag';

const fragmentShaderBase = RaymarchingFragmentShader.replace(
  '#include <frep_common>',
  FrepCommon
);

export default class RaymarchingPass extends Pass {
  private scene: Scene;
  private camera: OrthographicCamera;
  private renderTargetDepth: WebGLRenderTarget;
  private materialDepth: MeshDepthMaterial;
  public materialRaymarching: ShaderMaterial;
  private materialCopy: ShaderMaterial;

  private fsQuad: FullScreenQuad;
  private oldClearColor: Color;

  private freps: NVFrep[] = [];
  private visibleFrepCount: number = 0;
  private selectedFrepCount: number = 0;

  constructor (scene: Scene, camera: OrthographicCamera, envMap: Texture, params = { width: 0, height: 0 }) {
    super();

    this.scene = scene;
    this.camera = camera;

    const width = params.width || window.innerWidth || 1;
    const height = params.height || window.innerHeight || 1;

    this.renderTargetDepth = new WebGLRenderTarget(width, height, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      stencilBuffer: false
    });

    this.renderTargetDepth.texture.name = 'RaymarchingPass.depth';

    // depth material
    this.materialDepth = new MeshDepthMaterial({
      side: DoubleSide
    });
    this.materialDepth.depthPacking = RGBADepthPacking;
    this.materialDepth.blending = NoBlending;

    this.materialRaymarching = new ShaderMaterial({
      defines: {
        ITERATIONS: FrepRenderingQuality.Normal,
        // "ITERATIONS": 64,
        DEPTH_PACKING: 1,
        // "DEPTH_TEST": 0,
        DEPTH_TEST: 1,
        PERSPECTIVE_CAMERA: 0,
        EXISTS_SCENE: 0,
        EXISTS_SELECTED_SCENE: 0,
        SCENE_CODE: '',
        SELECTED_SCENE_CODE: ''
      },
      uniforms: {
        time: { value: 0.0 },
        tDiffuse: { value: null },
        tDepth: { value: null },
        tEnv: { value: envMap },

        isNormal: { value: false },
        ambient: { value: PreviewColors.ambient },
        defaultColor: { value: PreviewColors.defaultStandard },
        selectedColor: { value: PreviewColors.selectedStandard },
        lightDir: { value: new Vector3(0, 0, 1) },

        resolution: { value: new Vector2(1024, 768) },
        cameraPosition: { value: this.camera.position },
        cameraWorldMatrix: { value: this.camera.matrixWorld },
        cameraProjectionMatrixInverse: { value: this.camera.projectionMatrixInverse },

        cameraViewMatrix: { value: null },
        cameraProjectionMatrix: { value: this.camera.projectionMatrix },

        cameraDirection: { value: new Vector3() },
        cameraUp: { value: new Vector3() },
        cameraRight: { value: new Vector3() },
        cameraFocalLength: { value: 1.0 },
        cameraAspect: { value: 1.0 },
        cameraFov: { value: 1.0 },

        cameraOrthRect: { value: new Vector2() },

        nearClip: { value: 1.0 },
        farClip: { value: 1000.0 },
        threshold: { value: 1e-4 }
      },
      vertexShader: QuadVertexShader,
      fragmentShader: this.fragmentShader()
    });

    const shader = CopyShader;
    this.materialCopy = new ShaderMaterial({
      uniforms: UniformsUtils.clone(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      depthTest: false,
      depthWrite: false
    });

    this.fsQuad = new FullScreenQuad(undefined);
    this.oldClearColor = new Color();
  }

  private fragmentShader (frepCustomFunction: string = ''): string {
    return fragmentShaderBase.replace(
      '#include <frep_custom_function>',
      frepCustomFunction
    );
  }

  public update (freps: NVFrep[]): void {
    this.freps = freps;

    const defines = this.materialRaymarching.defines;

    const filters = this.freps.map(fr => fr.entity).flat(1).filter(fr => isFrepCustomFunction(fr));
    const frepCustomFunction = filters.filter((fr, idx) => {
      return filters.indexOf(fr) === idx;
    }).map((fr) => {
      return fr.fn();
    }).join('\n');

    const visibles = this.freps.filter(n => n.visible);
    const unselected = visibles.filter(n => !n.selected);
    const selected = visibles.filter(n => n.selected);

    this.visibleFrepCount = visibles.length;
    this.selectedFrepCount = selected.length;

    const existsScene = unselected.length > 0;
    defines.EXISTS_SCENE = existsScene ? 1 : 0;
    if (existsScene) {
      defines.SCENE_CODE = this.compile(unselected);
    }

    const existsSelectedScene = selected.length > 0;
    defines.EXISTS_SELECTED_SCENE = existsSelectedScene ? 1 : 0;
    if (existsSelectedScene) {
      defines.SELECTED_SCENE_CODE = this.compile(selected);
    }

    this.materialRaymarching.fragmentShader = this.fragmentShader(frepCustomFunction);
    this.materialRaymarching.needsUpdate = true;
  }

  private checkNeedsUpdate (): boolean {
    const visibles = this.freps.filter(n => n.visible);
    return (visibles.length !== this.visibleFrepCount || visibles.filter(n => n.selected).length !== this.selectedFrepCount);
  }

  private compile (freps: NVFrep[]): string {
    const n = freps.length;
    const codes = freps.map(f => f.compile('p'));
    if (n <= 1) {
      return `return ${codes[0]};`;
    } else {
      // TODO: Deep nest causes 'Expression too complex error'?
      const lines = [];
      const u1 = `float u1 = min(${codes[0]}, ${codes[1]});`;
      lines.push(u1);
      for (let i = 2; i < n; i++) {
        const u = `float u${i} = min(u${i - 1}, ${codes[i]});`;
        lines.push(u);
      }
      const union = lines.join(';');
      return `${union} return u${n - 1};`;
    }
  }

  private through (renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, texture: Texture): void {
    this.fsQuad.material = this.materialCopy;
    this.materialCopy.uniforms.tDiffuse.value = texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) { renderer.clear(); }
    this.fsQuad.render(renderer);
  }

  public render (renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget) {
    if (this.checkNeedsUpdate()) {
      this.update(this.freps);
    }

    const defines = this.materialRaymarching.defines;
    const exists: boolean = defines.EXISTS_SCENE || defines.EXISTS_SELECTED_SCENE;
    if (!exists) {
      this.through(renderer, writeBuffer, readBuffer.texture);
      return;
    }

    // Render depth into texture
    this.scene.overrideMaterial = this.materialDepth;

    renderer.getClearColor(this.oldClearColor);
    const oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setClearColor(0xFFFFFF);
    renderer.setClearAlpha(1.0);
    renderer.setRenderTarget(this.renderTargetDepth);
    renderer.clear();
    renderer.render(this.scene, this.camera);

    // Raymarching

    const size = new Vector2();
    renderer.getSize(size);
    const pix = renderer.getPixelRatio();
    size.multiplyScalar(pix);

    this.materialRaymarching.uniforms.resolution.value = size;
    this.camera.getWorldPosition(this.materialRaymarching.uniforms.cameraPosition.value);
    this.camera.getWorldDirection(this.materialRaymarching.uniforms.cameraDirection.value);

    const up = new Vector3(0, 1, 0);
    up.applyEuler(this.camera.rotation);
    this.materialRaymarching.uniforms.cameraUp.value = up;
    this.materialRaymarching.uniforms.cameraRight.value = (new Vector3()).crossVectors(this.materialRaymarching.uniforms.cameraDirection.value, this.materialRaymarching.uniforms.cameraUp.value);

    const w = this.camera.right - this.camera.left;
    const h = this.camera.top - this.camera.bottom;
    // console.log(w, h, this.camera.zoom)
    this.materialRaymarching.uniforms.cameraOrthRect.value.set(w / this.camera.zoom, h / this.camera.zoom);

    this.materialRaymarching.uniforms.cameraWorldMatrix.value = this.camera.matrixWorld;
    this.materialRaymarching.uniforms.cameraProjectionMatrixInverse.value = this.camera.projectionMatrixInverse;

    this.materialRaymarching.uniforms.cameraViewMatrix.value = this.camera.matrixWorldInverse;
    this.materialRaymarching.uniforms.cameraProjectionMatrix.value = this.camera.projectionMatrix;

    this.materialRaymarching.uniforms.nearClip.value = this.camera.near;
    this.materialRaymarching.uniforms.farClip.value = this.camera.far;

    this.materialRaymarching.uniforms.tDiffuse.value = readBuffer.texture;
    this.materialRaymarching.uniforms.tDepth.value = this.renderTargetDepth.texture;

    this.fsQuad.material = this.materialRaymarching;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      renderer.clear();
      this.fsQuad.render(renderer);
    }

    this.scene.overrideMaterial = null;
    renderer.setClearColor(this.oldClearColor);
    renderer.setClearAlpha(oldClearAlpha);
    renderer.autoClear = oldAutoClear;
  }

  public setIterations (iterations: number) {
    this.materialRaymarching.defines.ITERATIONS = iterations;
    this.materialRaymarching.needsUpdate = true;
  }
}
