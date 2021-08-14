
import NodeBase from '../../core/nodes/NodeBase';
import Output from '../../core/io/Output';
import IO from '../../core/io/IO';
import IOView from './IOView';
import NodeView from './NodeView';
import EdgeViewBase from './EdgeViewBase';

export default class EdgeView extends EdgeViewBase {
  protected output: WeakRef<IOView>;
  protected input: WeakRef<IOView>;

  constructor (output: IOView, input: IOView) {
    super();

    this.output = new WeakRef(output);
    this.input = new WeakRef(input);

    output.onDispose.on(() => () => {
      this.dispose();
    });
    input.onDispose.on(() => {
      this.dispose();
    });

    const io = output.getIO() as Output;
    io.onStateChanged.on(() => {
    });
    io.onDataChanged.on(() => {
      if (io.isEmpty()) {
        this.path.classList.add('empty');
      } else {
        this.path.classList.remove('empty');
      }
    });
  }

  public getOutput (): IOView {
    return this.output.deref() as IOView;
  }

  public getInput (): IOView {
    return this.input.deref() as IOView;
  }

  public track (): void {
    const start = this.getOutput().getWorldPosition();
    const end = this.getInput().getWorldPosition();
    this.updateBezier(start.x, start.y, end.x, end.y);
  }

  public highlight (): void {
    this.select();
  }

  public unhighlight (): void {
    this.unselect();
  }

  public update (node: NodeBase) {
    if (node.selected) {
      this.select();
    } else {
      this.unselect();
    }

    /*
    let empty = this.edge.hasInput() && this.fromIO.io.node.isEmpty()
    if (empty) {
      this.path.classList.add('empty')
    } else {
      this.path.classList.remove('empty')
    }
    */
  }

  public hasNode (node: NodeBase): boolean {
    return (this.getInput().getIO().getParent() === node) || (this.getOutput().getIO().getParent() === node);
  }

  public hasNodeView (other: NodeView): boolean {
    return other.hasIOView(this.getOutput()) || other.hasIOView(this.getInput());
  }

  public hasIO (io: IO): boolean {
    return this.input.deref()?.getIO() === io || this.output.deref()?.getIO() === io;
  }

  public hasIOView (view: IOView): boolean {
    return this.input.deref() === view || this.output.deref() === view;
  }
}
