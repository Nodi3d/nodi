import { NodeBase } from '@nodi/core';
import { Vector2 } from 'three';
import Editor, { EditorMouseInput } from '../Editor';
import GroupView from '../views/GroupView';
import { MoveNodesOperation } from '../operations';
import StateBase from './StateBase';
import IdleState from './IdleState';
import DragOutScreenStateBase from './DragOutScreenStateBase';

export default class SelectGroupState extends DragOutScreenStateBase {
  private view: GroupView;
  private prevMousePosition?: Vector2;

  constructor (context: Editor, view: GroupView) {
    super(context);
    this.view = view;
    this.view.select();

    this.getNodes(context).forEach(n => n.prepareTransform());
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    if (input.which === 1 && !context.panable(input.which, input.event.shiftKey)) { // CAUTION: Panningとバッティングしないようにする条件
      if (this.prevMousePosition === undefined) {
        this.prevMousePosition = input.position;
      }

      const scale = context.scale;
      const dx = (input.position.x - this.prevMousePosition.x) / scale;
      const dy = (input.position.y - this.prevMousePosition.y) / scale;

      this.getNodes(context).forEach(n => n.move(dx, dy));
      this.prevMousePosition.copy(input.position);
    }
    return this;
  }

  public mouseUp (context: Editor, _input: EditorMouseInput): StateBase {
    this.view.unselect();

    const nodes = this.getNodes(context);
    const op = new MoveNodesOperation(nodes);
    context.pushHistory(op);

    return new IdleState(context);
  }

  protected onDragOut (context: Editor, _input: EditorMouseInput, delta: Vector2): void {
    this.getNodes(context).forEach(n => n.move(delta.x, delta.y));
  }

  private getNodes (context: Editor): NodeBase[] {
    return context.nodes.filter(n => this.view.hasNode(n.uuid));
  }
}
