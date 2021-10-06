import { Vector2 } from 'three';
import Editor, { EditorMouseInput } from '../Editor';
import { MoveNodesOperation } from '../operations';
import DragOutScreenStateBase from './DragOutScreenStateBase';
import IdleState from './IdleState';
import StateBase from './StateBase';

export default class DragNodeState extends DragOutScreenStateBase {
  protected prevMousePosition: Vector2;
  protected interval: NodeJS.Timeout | null = null;

  constructor (context: Editor, input: EditorMouseInput) {
    super(context);
    this.prevMousePosition = input.position;
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    const scale = context.scale;
    const dx = (input.position.x - this.prevMousePosition.x) / scale;
    const dy = (input.position.y - this.prevMousePosition.y) / scale;

    context.selectedNodes.forEach(node => node.move(dx, dy));
    this.prevMousePosition.copy(input.position);

    return this;
  }

  public mouseUp (context: Editor, _input: EditorMouseInput): StateBase {
    const op = new MoveNodesOperation(context.selectedNodes);
    context.pushHistory(op);
    context.unselectAllNodes();
    return new IdleState(context);
  }

  protected onDragOut (context: Editor, _input: EditorMouseInput, delta: Vector2): void {
    context.selectedNodes.forEach((node) => {
      node.move(delta.x, delta.y);
    });
  }
}
