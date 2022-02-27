
import { AmbientLight, Box3, Camera, Color, DirectionalLight, Group, LinearToneMapping, Mesh, Object3D, OrthographicCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { Easing, Tween, Group as TweenGroup } from '@tweenjs/tween.js';
import { debounce, DebouncedFunc } from 'lodash';

import {
  Output,
  GeometryDataTypes,
  NCurve, NPolylineCurve,
  NNurbsCurve,
  NPoint, NMesh, NPlane, NBoundingBox, NSurface,
  TypedEvent, IElementable, isDisplayNode, DataTree, NLineCurve, NRectangleCurve, GradientCubeTexture, NFrepBase, IResolutionResponsible, isResolutionResponsible, IDisposable, RenderingMode, PreviewColors, GridGroup, GridGeometry, Axes, BoundingBoxLineSegments, NVBox, NVPlane, NVMesh, NVPoints, NVLine, NVFrep, NVPointTransformControls, CoordinateMode, isRenderingModeResponsible,
  NodeBase, Point
} from '@nodi/core';
import RaymarchingPass from './RaymarchingPass';

const minZoomScale = 1 / 2;
const maxZoomScale = 1e2 * 2.5;

type ControlPivot = {
  position0: Vector3;
  target0: Vector3;
  zoom0: number;
};

export default class Viewer implements IDisposable {
  public onViewChanged: TypedEvent<OrthographicCamera> = new TypedEvent();
  public onBoundingBoxChanged: TypedEvent<{ size: Vector3, box: Box3 }> = new TypedEvent();
  public onFrepChanged: TypedEvent<boolean> = new TypedEvent();

  private el: HTMLElement;
  private observer: ResizeObserver;
  private requestAnimationId: number = -1;

  private renderer: WebGLRenderer = new WebGLRenderer({
    preserveDrawingBuffer: true,
    antialias: true
  });

  private composer: EffectComposer;
  private pass!: RaymarchingPass;

  private coordinate: CoordinateMode = CoordinateMode.ZUp;
  private scene: Scene = new Scene();
  private container: Group = new Group();
  private renderingMode: RenderingMode = RenderingMode.Standard;
  private cubeMap: GradientCubeTexture = new GradientCubeTexture();
  private ambient: AmbientLight = new AmbientLight(PreviewColors.ambient);
  private light: DirectionalLight = new DirectionalLight(0xFFFFFF, 0.8);
  public camera: OrthographicCamera;
  private cameraControls: OrbitControls;
  private controlPivot: ControlPivot = {
    position0: new Vector3(30, -30, 30),
    target0: new Vector3(),
    zoom0: 1
  };

  private factor: number = 50;
  private near: number = 0.1;
  private far: number = 100;

  private boundingBox: BoundingBoxLineSegments = new BoundingBoxLineSegments();
  private axes: Axes = new Axes(1000, new Color(0xFF2B56), new Color(0x109151), new Color(0x428DFF));
  private gridContainer: Group = new Group();
  private xzGrid: GridGroup;
  private xyGrid: GridGroup;
  private yzGrid: GridGroup;

  private tweens: TweenGroup = new TweenGroup();

  private elements: IElementable[] = [];
  private freps: NVFrep[] = [];
  private listeners: { listener: IDisposable; node: NodeBase; } [] = [];
  private debouncedComputeBoundingBox: DebouncedFunc<() => Box3> = debounce(this.computeBoundingBox, 25);
  public debouncedUpdate: DebouncedFunc<(nodes: NodeBase[]) => void> = debounce(this.update, 50);

  constructor (root: HTMLElement) {
    this.el = root;

    const r = this.el.getBoundingClientRect();
    const w = r.width; const h = r.height;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0xFFFFFF, 1);
    this.renderer.toneMapping = LinearToneMapping;
    this.renderer.localClippingEnabled = true;
    this.el.appendChild(this.renderer.domElement);

    this.light.position.set(-20, -50, 50);

    this.scene.add(this.ambient);
    this.scene.add(this.light);

    this.scene.add(this.container);
    this.scene.add(this.boundingBox);

    this.camera = new OrthographicCamera(w / -this.factor, w / this.factor, h / this.factor, h / -this.factor, this.near, this.far);
    this.camera.up.set(0, 0, 1);
    // this.camera.position.set(30, 30, 30);
    this.camera.position.set(30, -30, 30);
    this.cameraControls = this.createCameraControls(minZoomScale, maxZoomScale);

    this.composer = new EffectComposer(this.renderer);
    this.setupComposer(this.composer, this.scene, this.camera, this.ambient.color);

    const gridGeometry = new GridGeometry(100, 1);
    this.xzGrid = new GridGroup(gridGeometry);
    this.xyGrid = new GridGroup(gridGeometry);
    this.yzGrid = new GridGroup(gridGeometry);
    this.setupGrid();

    let last = this.getCurrent();
    const fps = 40;
    const interval = 1000 / fps;

    const tick = (time: number) => {
      this.requestAnimationId = requestAnimationFrame(tick);
      this.tweens.update(time);

      const cur = this.getCurrent();
      const dur = cur - last;
      if (dur > interval) {
        this.tick();
        last = cur;
      }
    };
    tick(0);

    this.observer = new ResizeObserver(() => {
      this.resize();
    });
    this.observer.observe(this.el);
  }

  private setupComposer (composer: EffectComposer, scene: Scene, camera: Camera, ambient: Color): void {
    composer.addPass(new RenderPass(scene, camera));
    this.pass = new RaymarchingPass(this.scene, this.camera, this.cubeMap);
    this.pass.materialRaymarching.uniforms.ambient.value = ambient;
    this.pass.materialRaymarching.uniforms.lightDir.value = this.light.position.clone().normalize();
    this.pass.enabled = false; // disable by default
    this.composer.addPass(this.pass);
  }

  private setupGrid (): void {
    this.scene.add(this.gridContainer);

    this.xyGrid.rotation.set(Math.PI * 0.5, 0, 0);
    this.yzGrid.rotation.set(0, 0, Math.PI * 0.5);

    this.gridContainer.add(this.xzGrid);
    this.gridContainer.add(this.xyGrid);
    this.gridContainer.add(this.yzGrid);

    // this.xzGrid.visible = this.xyGrid.visible = this.yzGrid.visible = false
    // this.xzGrid.visible = this.yzGrid.visible = false
    // this.xyGrid.visible = this.yzGrid.visible = false; // y up
    this.xzGrid.visible = this.yzGrid.visible = false; // z up
    this.xyGrid.renderOrder = 0;

    this.gridContainer.add(this.axes);

    this.axes.renderOrder = 10000;
  }

  private createCameraControls (minZoomScale: number, maxZoomScale: number): OrbitControls {
    const cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
    cameraControls.minZoom = minZoomScale;
    cameraControls.maxZoom = maxZoomScale;
    cameraControls.enableKeys = false;
    cameraControls.addEventListener('change', (_e) => {
      this.light.position.copy(this.camera.position);
      this.pass.materialRaymarching.uniforms.lightDir.value = this.light.position.clone().normalize();

      this.setResolutions();
      this.notifyViewChanged();
    });
    cameraControls.panSpeed = 1.25;
    cameraControls.rotateSpeed = 1.0;
    cameraControls.zoomSpeed = 1.5;
    cameraControls.screenSpacePanning = true;
    return cameraControls;
  }

  private mesh (mesh: NMesh): IElementable {
    return new NVMesh(mesh.build(), this.renderingMode);
  }

  private surface (surface: NSurface): IElementable {
    const option = {
      minDivsV: 1,
      minDivsU: 1,
      refine: false,

      // min & max depth mean # of divide in a patch
      maxDepth: 4,
      minDepth: 0,

      // threshold to divide
      normTol: 2.5e-2
    };
    const mesh = surface.tessellate(option);
    return new NVMesh(mesh.build(), this.renderingMode);
  }

  private curve (curve: NCurve): IElementable {
    let points: NPoint[] = [];

    try {
      if (curve instanceof NPolylineCurve) {
        points = curve.points.map(p => p.clone());
        if (curve.closed && points.length > 0) {
          points.push(points[0].clone());
        }
      } else if (curve instanceof NLineCurve) {
        points = [curve.a, curve.b];
      } else if (curve instanceof NNurbsCurve) {
        points = curve.tessellate();
      } else if (curve instanceof NRectangleCurve) {
        points = curve.getCornerPoints();
        points.push(points[0]);
      } else {
        points = curve.getPoints(30);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    return new NVLine(points);
  }

  private points (points: Vector3[]): IElementable {
    return new NVPoints(points);
  }

  private plane (plane: NPlane): IElementable {
    return new NVPlane(plane);
  }

  private box (box: NBoundingBox): IElementable {
    return new NVBox(box);
  }

  private generate (output: Output): IElementable[] {
    const elements: IElementable[] = [];
    const data = output.getData();

    data?.traverse((value: any) => {
      if (value instanceof NMesh) {
        elements.push(this.mesh(value));
      } else if (value instanceof NSurface) {
        elements.push(this.surface(value));
      } else if (value instanceof NCurve) {
        elements.push(this.curve(value));
      } else if (value instanceof NPoint) {
        elements.push(this.points([value]));
      } else if (value instanceof NPlane) {
        elements.push(this.plane(value));
      } else if (value instanceof NBoundingBox) {
        elements.push(this.box(value));
      } else if (value instanceof NFrepBase) {
        elements.push(new NVFrep(value));
      }
    });

    return elements;
  }

  private clearUnrefChangedElements (nodes: NodeBase[]): void {
    const elements = this.elements;
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const found = nodes.find(n => n.uuid === element.node);
      if (found === undefined || found.hasChanged()) {
        elements.splice(i, 1);
        this.destroy(element);
      }
    }
  }

  private hasRefElement (node: NodeBase): boolean {
    return this.elements.some(e => e.node === node.uuid);
  }

  private clearRefElements (node: NodeBase) {
    const elements = this.elements;
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.node === node.uuid) {
        elements.splice(i, 1);
        this.destroy(element);
      }
    }
  }

  private clearUnrefListeners (nodes: NodeBase[]): void {
    // clear event listeners
    for (let i = this.listeners.length - 1; i >= 0; i--) {
      const l = this.listeners[i];
      if (!nodes.includes(l.node)) {
        l.listener.dispose();
        this.listeners.splice(i, 1);
      }
    }
  }

  private clearRefListeners (node: NodeBase): void {
    // clear event listeners related to changed node
    for (let i = this.listeners.length - 1; i >= 0; i--) {
      const l = this.listeners[i];
      if (l.node === node) {
        l.listener.dispose();
        this.listeners.splice(i, 1);
      }
    }
  }

  private destroy (element: IElementable): void {
    this.container.remove(element as any);
    element.dispose();
  }

  public update (nodes: NodeBase[]): void {
    const enabled = nodes.filter(n => n.enabled && n.previewable);

    this.clearUnrefChangedElements(enabled);
    this.clearUnrefListeners(enabled);

    for (let i = 0, n = enabled.length; i < n; i++) {
      const node = enabled[i];

      if (!node.hasChanged()) { continue; }

      this.clearRefListeners(node);

      if (node.visible) {
        this.process(node);
      } else {
        const listener = node.onStateChanged.on((e) => {
          const has = this.hasRefElement(e.node);
          if (e.node.enabled && e.node.visible && !has) {
            this.process(e.node);
            this.clearRefListeners(e.node);
            this.updateFrep();
            this.debouncedComputeBoundingBox();
            listener.dispose();
          }
        });
        this.listeners.push({
          listener, node
        });
      }

      node.markUnchanged();
    }

    this.updateFrep();
    this.debouncedComputeBoundingBox();
  }

  private process (node: NodeBase): void {
    const n = node.outputManager.getIOCount();

    const elements: IElementable[] = [];

    for (let i = 0; i < n; i++) {
      const output = node.outputManager.getOutput(i) as Output;
      const type = output.getDataType();
      if ((type & GeometryDataTypes) !== 0) {
        const el = this.generate(output);
        elements.push(...el);
      }
    }

    // Attach NVPointTransformControls if Point node has no sources
    if (node instanceof Point && elements.length > 0 && !node.inputManager.inputs.some(input => input.hasSource())) {
      const listener = node.onStateChanged.on(() => {
        const controls = this.elements.filter(el => el.node === node.uuid && el instanceof NVPointTransformControls) as NVPointTransformControls[];
        controls.forEach((c) => {
          this.destroy(c);
        });
        if (node.selected) {
          const control = this.attach(node, elements[0] as any);
          control.setup(node);
          this.container.add(control as any);
          this.elements.push(control);
        }
      });
      this.listeners.push({
        listener, node
      });
      if (node.selected) {
        const control = this.attach(node, elements[0] as any);
        elements.push(control);
      }
    }

    if (isDisplayNode(node)) {
      const el = node.display();
      elements.push(...el);
    }

    elements.forEach((el) => {
      el.setup(node);
      this.container.add(el as any);
      this.elements.push(el);
      if (isResolutionResponsible(el)) { this.setResolution(el); }
    });
  }

  private updateFrep (): void {
    this.freps = this.container.children.filter(o => (o instanceof NVFrep)) as NVFrep[];
    this.updateFrepPass(this.freps);
  }

  private updateFrepPass (freps: NVFrep[]): void {
    this.pass.update(freps);
    const enabled = freps.length > 0;
    const prev = this.pass.enabled;
    this.pass.enabled = enabled;
    if (prev !== enabled) {
      this.onFrepChanged.emit(enabled);
    }
  }

  private attach (node: Point, el: Object3D): NVPointTransformControls {
    const control = new NVPointTransformControls(this.camera, this.renderer.domElement);
    control.addEventListener('dragging-changed', (e) => {
      this.cameraControls.enabled = !e.value;
      if (!e.value) {
        const position = new Vector3();
        el.getWorldPosition(position);
        let changed = false;

        const inputManager = node.inputManager;
        const inputs = inputManager.inputs;
        inputs.forEach((input, dim) => {
          const data = input.getDefault();
          const v = data.getItemsByIndex(0)[0];
          const component = position.getComponent(dim);
          if (v !== component) {
            input.setDefault(new DataTree().add([component]));
            changed = true;
          }
        });
        if (changed) {
          node.notifyValueChanged();
        }
      }
    });
    control.attach(el);
    return control;
  }

  private getCurrent (): number {
    return performance.now();
  }

  private tick (): void {
    if (this.cameraControls.enabled) { this.cameraControls.update(); }

    this.xzGrid.update(this.camera);
    this.xyGrid.update(this.camera);
    this.yzGrid.update(this.camera);

    this.container.traverse((object) => {
      if (object instanceof Mesh && object.material.envMap !== this.cubeMap) {
        object.material.envMap = this.cubeMap;
        object.material.needsUpdate = true;
      }
    });

    this.renderer.setClearColor(0xFFFFFF, 1);
    this.composer.render();
  }

  private resize (): void {
    const nr = this.el.getBoundingClientRect();
    const w = nr.width; const h = nr.height;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);

    this.camera.left = -w / this.factor;
    this.camera.right = w / this.factor;
    this.camera.top = h / this.factor;
    this.camera.bottom = -h / this.factor;
    this.camera.updateProjectionMatrix();

    this.setResolutions();
  }

  public setRenderingMode (mode: RenderingMode): void {
    this.renderingMode = mode;
    this.container.traverse((o) => {
      if (isRenderingModeResponsible(o)) {
        o.setRenderingMode(mode);
      }
    });
    this.pass.materialRaymarching.uniforms.isNormal.value = (mode !== RenderingMode.Standard);
  }

  public setRenderingQuality (iterations: number): void {
    this.pass.setIterations(iterations);
  }

  private setResolutions (): void {
    this.container.traverse((object) => {
      if (isResolutionResponsible(object)) {
        this.setResolution(object);
      }
    });
    this.setResolution(this.boundingBox);
  }

  private setResolution (object: IResolutionResponsible): void {
    const nr = this.el.getBoundingClientRect();
    const w = nr.width; const h = nr.height;
    object.setResolution(w, h, this.camera.zoom);
  }

  public setFullscreen (flag: boolean = true): void {
    if (flag) {
      this.el.classList.add('fullscreen');
    } else {
      this.el.classList.remove('fullscreen');
    }
    this.resize();
  }

  public setGrid (visible: boolean): void {
    this.gridContainer.visible = visible;
  }

  public toggleGrid (): void {
    this.gridContainer.visible = !this.gridContainer.visible;
  }

  public setBoundingBox (visible: boolean): void {
    this.boundingBox.visible = visible;
  }

  public toggleBoundingBox (): void {
    this.boundingBox.visible = !this.boundingBox.visible;
  }

  public toggleFullscreen (): boolean {
    const isFullscreen = this.el.classList.toggle('fullscreen');
    this.resize();
    return isFullscreen;
  }

  public resetCamera (): void {
    this.fitCamera();
  }

  public zoomTo (nodes: NodeBase[], normal = new Vector3(1, 1, 1)): void {
    const box = this.computeSelectedBoundingBox(nodes);
    const size = new Vector3();
    box.getSize(size);

    if (size.length() > 0) {
      const center = new Vector3();
      box.getCenter(center);

      this.resize();

      this.setZoom(this.controlPivot.zoom0, false);
      // this.controlPivot.position0.copy(center.clone().add(normal.multiplyScalar(this.far * 0.5)));
      // this.controlPivot.target0.copy(center);
    }

    this.cameraControls.reset();
    this.notifyViewChanged();
  }

  public setCameraDirection (direction: Vector3): void {
    this.tweens.removeAll();

    const origin = this.controlPivot.target0;
    const distance = this.camera.position.distanceTo(origin);
    const to = origin.clone().add(direction.clone().multiplyScalar(distance));

    let grid: GridGroup;
    const dx = Math.abs(direction.dot(new Vector3(1, 0, 0)));
    const dy = Math.abs(direction.dot(new Vector3(0, 1, 0)));
    if (dx >= 1.0) {
      grid = this.yzGrid;
    } else if (dy >= 1.0) {
      grid = this.xzGrid;
    } else {
      grid = this.xyGrid;
    }
    this.gridContainer.children.forEach((g) => {
      g.visible = (grid === g);
    });

    this.controlPivot.position0.copy(to);
    this.cameraControls.reset();
    this.cameraControls.enabled = false;

    const current = this.camera.position.clone();
    const tw = new Tween(current)
      .to(to, 250)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this.camera.position.copy(current);
        this.camera.lookAt(origin);

        this.notifyViewChanged();
      })
      .onComplete(() => {
        this.cameraControls.target.copy(origin);
        this.camera.position.copy(to);
        this.camera.lookAt(origin);

        this.cameraControls.saveState();
        this.cameraControls.reset();
        this.cameraControls.enabled = true;

        this.notifyViewChanged();
      })
      .start();

    this.tweens.add(tw);
  }

  private traverseExpandBox3 (object: Object3D, box: Box3): void {
    if (object.visible && !(object instanceof NVPointTransformControls)) {
      box.expandByObject(object);
    }
  }

  private computeBoundingBox (): Box3 {
    const box = new Box3();

    this.freps.forEach((frep) => {
      const fb = frep.entity.boundingBox;
      if (frep.visible && fb !== undefined) {
        const minmax = fb.getMinMax();
        box.min.x = Math.min(box.min.x, minmax.min.x);
        box.min.y = Math.min(box.min.y, minmax.min.y);
        box.min.z = Math.min(box.min.z, minmax.min.z);
        box.max.x = Math.max(box.max.x, minmax.max.x);
        box.max.y = Math.max(box.max.y, minmax.max.y);
        box.max.z = Math.max(box.max.z, minmax.max.z);
      }
    });

    const size = new Vector3();
    box.getSize(size);

    // Use frep bounding box as adaptive eps in raymarching
    const s = Math.max(size.x, size.y, size.z);
    this.pass.materialRaymarching.uniforms.threshold.value = (s <= 0) ? 1e-5 : (s * 1e-3);

    this.container.traverse((object) => {
      if (object.visible && object.parent === this.container) {
        this.traverseExpandBox3(object, box);
      }
    });

    this.boundingBox.update(box);
    this.setResolution(this.boundingBox);

    this.onBoundingBoxChanged.emit({ size: this.boundingBox.displaySize, box: this.boundingBox.box });

    box.getSize(size);
    if (size.length() > 0) {
      const forward = new Vector3();
      this.camera.getWorldDirection(forward);
      const factor = this.getFactor(box, forward);
      this.setZoom(factor / this.factor);
    }

    return box;
  }

  private computeSelectedBoundingBox (nodes: NodeBase[]): Box3 {
    const box = new Box3();

    this.elements.forEach((el) => {
      const found = nodes.find(n => n.uuid === el.node);
      if (found !== undefined && (el as any).visible) {
        this.traverseExpandBox3(el as any, box);
      }
    });

    const size = new Vector3();
    box.getSize(size);

    if (size.length() > 0) {
      const forward = new Vector3();
      this.camera.getWorldDirection(forward);
      const factor = this.getFactor(box, forward);
      this.setZoom(factor / this.factor, false);
    }

    return box;
  }

  private setNear (near: number): void {
    this.near = near;
    this.camera.near = near;
  }

  private setFar (far: number): void {
    far = Math.max(far, 100);
    this.far = far;
    this.camera.far = far;
  }

  private setZoom (zoom: number, force = false): void {
    this.controlPivot.zoom0 = zoom;

    let minZoom = zoom * minZoomScale;
    if (!force) {
      minZoom = Math.min(this.cameraControls.minZoom, minZoom);
    }
    this.cameraControls.minZoom = minZoom;

    // this.cameraControls.maxZoom = zoom * maxZoomScale
    this.cameraControls.maxZoom = maxZoomScale;

    const distance = this.factor / (this.cameraControls.minZoom / 5);
    this.setFar(distance);
  }

  private getFactor (box: Box3, normal: Vector3): number {
    const minmax = this.project(box, normal);

    const r = this.el.getBoundingClientRect();
    const w = r.width; const h = r.height;
    const interval = Math.max((minmax.max.x - minmax.min.x), (minmax.max.y - minmax.min.y));

    return Math.min(w, h) / interval;
  }

  public fitCamera (normal = new Vector3(-1, -1, 1)): void {
    this.cameraControls.enabled = false;

    const box = this.computeBoundingBox();
    const size = new Vector3();
    box.getSize(size);

    if (size.length() > 0) {
      const center = new Vector3();
      box.getCenter(center);
      this.resize();

      this.setZoom(this.controlPivot.zoom0, true);
      this.controlPivot.position0.copy(center.clone().add(normal.multiplyScalar(this.far * 0.5)));
      this.controlPivot.target0.copy(center);
      this.camera.position.copy(this.controlPivot.position0);
      this.camera.lookAt(this.controlPivot.target0);
      this.camera.zoom = this.controlPivot.zoom0;
      this.cameraControls.saveState();
    }

    this.cameraControls.reset();
    this.notifyViewChanged();

    this.cameraControls.enabled = true;
  }

  private project (box: Box3, normal: Vector3): { min: Vector2, max: Vector2 } {
    const points = [
      new Vector3(box.min.x, box.min.y, box.min.z),
      new Vector3(box.max.x, box.min.y, box.min.z),
      new Vector3(box.max.x, box.min.y, box.max.z),
      new Vector3(box.min.x, box.min.y, box.max.z),
      new Vector3(box.min.x, box.max.y, box.min.z),
      new Vector3(box.max.x, box.max.y, box.min.z),
      new Vector3(box.max.x, box.max.y, box.max.z),
      new Vector3(box.min.x, box.max.y, box.max.z)
    ];

    let sx = Number.MAX_VALUE;
    let ex = Number.MIN_VALUE;
    let sy = Number.MAX_VALUE;
    let ey = Number.MIN_VALUE;
    points.forEach((p) => {
      const projected = p.clone().projectOnPlane(normal);
      sx = Math.min(sx, projected.x);
      sy = Math.min(sy, projected.y);
      ex = Math.max(ex, projected.x);
      ey = Math.max(ey, projected.y);
    });

    return {
      min: new Vector2(sx, sy),
      max: new Vector2(ex, ey)
    };
  }

  private notifyViewChanged (): void {
    this.onViewChanged.emit(this.camera);
  }

  public capture (): Blob | undefined {
    const base64 = this.renderer.domElement.toDataURL();
    const bin = atob(base64.replace(/^.*,/, ''));
    const buffer = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      buffer[i] = bin.charCodeAt(i);
    }

    let blob: Blob;
    try {
      blob = new Blob([buffer.buffer], {
        type: 'image/png'
      });
    } catch (e) {
      return undefined;
    }

    return blob;
  }

  public dispose () {
    cancelAnimationFrame(this.requestAnimationId);
    this.renderer.dispose();
  }
}
