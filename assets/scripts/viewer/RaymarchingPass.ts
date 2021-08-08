import { Camera, Color, DoubleSide, Matrix4, MeshDepthMaterial, NearestFilter, NoBlending, OrthographicCamera, PerspectiveCamera, Quaternion, RenderTarget, RGBADepthPacking, Scene, ShaderMaterial, Texture, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass';
import FrepBase from '../core/math/frep/FrepBase';
import FrepNodeBase from '../core/nodes/frep/FrepNodeBase';
import NVFrep from './elements/NVFrep';
import { FrepRenderingQuality } from './misc/FrepRenderingQuality';

import QuadVertexShader from './shaders/raymarching/quad.vert';
import RaymarchingFragmentShader from './shaders/raymarching/raymarching.frag';

export default class RaymarchingPass extends Pass {
  private scene: Scene;
  private camera: OrthographicCamera;
  private renderTargetDepth: WebGLRenderTarget;
  private materialDepth: MeshDepthMaterial;
  public materialRaymarching: ShaderMaterial;

  private fsQuad: FullScreenQuad;
  private oldClearColor: Color;

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
        ambient: { value: new Color(0.2, 0.2, 0.2) },
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
      fragmentShader: RaymarchingFragmentShader
    });

    this.fsQuad = new FullScreenQuad(this.materialRaymarching);
    this.oldClearColor = new Color();
  }

  public update (freps: NVFrep[]): void {
    const visibles = freps.filter(n => n.visible);
    const defines = this.materialRaymarching.defines;

    const unselected = visibles.filter(n => !n.selected);
    const existsScene = unselected.length > 0;
    defines.EXISTS_SCENE = existsScene ? 1 : 0;
    if (existsScene) {
      defines.SCENE_CODE = this.compile(unselected);
    }

    const selected = visibles.filter(n => n.selected);
    const existsSelectedScene = selected.length > 0;
    defines.EXISTS_SELECTED_SCENE = existsSelectedScene ? 1 : 0;
    if (existsSelectedScene) {
      defines.SELECTED_SCENE_CODE = this.compile(selected);
    }

    console.log('update', selected, unselected);

    this.materialRaymarching.needsUpdate = true;
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
      return `${union}; return u${n - 1};`;
    }
  }

  public render (renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget) {
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
