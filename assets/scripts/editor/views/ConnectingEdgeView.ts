
import { Vector2 } from 'three';
import IOView from './IOView';
import EdgeViewBase from './EdgeViewBase';

export default class ConnectingEdgeView extends EdgeViewBase {
  protected io: WeakRef<IOView>;
  protected isDestination: boolean;

  constructor (io: IOView) {
    super();

    this.isDestination = io.isInput();
    this.io = new WeakRef(io);
  }

  public getIOView (): IOView {
    return this.io.deref() as IOView;
  }

  public IsDestinationNode (): boolean {
    return this.isDestination;
  }

  public updatePath (p: Vector2): void {
    if (this.isDestination) {
      this.handlePointToDest(p);
    } else {
      this.handleSourceToPoint(p);
    }
  }

  protected handleSourceToPoint (p: Vector2): void {
    const source = this.getIOView().getWorldPosition();
    this.updateBezier(source.x, source.y, p.x, p.y);
  }

  protected handlePointToDest (p: Vector2): void {
    const dest = this.getIOView().getWorldPosition();
    this.updateBezier(p.x, p.y, dest.x, dest.y);
  }
}
