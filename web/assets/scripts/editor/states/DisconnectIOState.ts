import Editor, { EditorMouseInput } from '../Editor';
import PolylineFigure from '../figures/PolylineFigure';
import { DisconnectOperation, SequentialOperation } from '../operations';
import { ConnectOperationArg } from '../operations/ConnectOperation';
import IdleState from './IdleState';
import StateBase from './StateBase';

export default class DisconnectIOState extends StateBase {
  private polyline: PolylineFigure = new PolylineFigure(2);

  constructor (context: Editor) {
    super(context);
    context.appendElement(this.polyline.el);
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    this.polyline.add(input.world.x, input.world.y);
    return this;
  }

  public mouseUp (context: Editor, input: EditorMouseInput): StateBase {
    const edges = context.getIntersectedEdges(this.polyline);

    const args: ConnectOperationArg[] = edges.map((edge) => {
      const output = edge.getOutput().getIO();
      const source = output.getParent();
      const oi = source.outputManager.getIOIndex(output);
      const input = edge.getInput().getIO();
      const destination = input.getParent();
      const ii = destination.inputManager.getIOIndex(input);
      return {
        srcNode: source.uuid,
        srcO: oi,
        dstNode: destination.uuid,
        dstI: ii
      };
    });

    const operations = args.map((arg) => {
      return new DisconnectOperation(arg);
    });
    const op = new SequentialOperation(operations);
    context.pushHistory(op).do(context);

    this.dispose();

    return new IdleState(context);
  }

  dispose (): void {
    this.polyline.dispose();
    super.dispose();
  }
}
