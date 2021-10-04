import { FrontSide, Object3D, Plane, RawShaderMaterial } from 'three';
import NMesh from '../../core/math/geometry/mesh/NMesh';
import NPlane from '../../core/math/geometry/NPlane';
import IDisposable from '../../core/misc/IDisposable';
import { IElementable } from '../../core/misc/IElementable';
import NodeBase from '../../core/nodes/NodeBase';
import { RenderingMode } from '../misc/RenderingMode';
import IRenderingModeResponsible, { isRenderingModeResponsible } from '../misc/IRenderingModeResponsible';
import NVCrossSectionMesh from './NVCrossSectionMesh';
import NVMesh from './NVMesh';

export default class NVClipping extends Object3D implements IElementable, IRenderingModeResponsible {
  private _listener?: IDisposable;

  constructor (mesh: NMesh, plane: NPlane) {
    super();

    const distance = plane.normal.dot(plane.origin);
    const clippingPlanes = [
      new Plane(plane.normal, -distance)
    ];

    const geometry = mesh.build();

    const back = new NVCrossSectionMesh(geometry);
    const front = new NVMesh(geometry, RenderingMode.Standard, FrontSide);

    (back.material as RawShaderMaterial).clippingPlanes = clippingPlanes;

    Object.values(front.materials).forEach((mat) => {
      mat.clippingPlanes = clippingPlanes;
    });

    back.renderOrder = 0;
    front.renderOrder = 1e6;

    this.add(back);
    this.add(front);
  }

  public setRenderingMode (mode: RenderingMode): void {
    this.traverse((o) => {
      if (o !== this && isRenderingModeResponsible(o)) {
        o.setRenderingMode(mode);
      }
    });
  }

  node: string = '';
  setup (node: NodeBase): void {
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

  select (node: NodeBase): void {
    this.children.forEach((o) => {
      const el = o as any as IElementable;
      el.select(node);
    });
  }

  dispose (): void {
    this._listener?.dispose();
  }
}
