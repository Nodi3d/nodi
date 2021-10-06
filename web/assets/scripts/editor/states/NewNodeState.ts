import { Vector2 } from 'three';
import { NodeConstructorType } from '@nodi/core';
import { KeyCodeStrings } from '../misc/KeyCodes';
import Editor, { EditorMouseInput } from '../Editor';
import AddNodeOperation from '../operations/AddNodeOperation';
import DragOutScreenStateBase from './DragOutScreenStateBase';
import IdleState from './IdleState';
import StateBase from './StateBase';

export default class NewNodeState extends DragOutScreenStateBase {
  protected nodeConstructor: NodeConstructorType;
  protected interval: NodeJS.Timeout | null = null;

  constructor (context: Editor, nodeConstructor: NodeConstructorType, position: Vector2) {
    super(context);

    this.nodeConstructor = nodeConstructor;

    const er = context.el.getBoundingClientRect();
    let wp;
    if (position !== undefined) {
      wp = context.getWorld(position.x - er.left, position.y - er.top);
    } else {
      wp = context.getWorld(context.prevMousePosition.x - er.left, context.prevMousePosition.y - er.top);
    }
    context.placeholder.show(wp.x, wp.y);
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    const world = input.world;
    context.placeholder.move(world.x, world.y);
    return this;
  }

  public mouseUp (context: Editor, input: EditorMouseInput): StateBase {
    this.addNode(context);
    return new IdleState(context);
  }

  public keyUp (context: Editor, e: KeyboardEvent): StateBase {
    if (e.key === KeyCodeStrings.ENTER) {
      this.addNode(context);
      return new IdleState(context);
    } else if (e.key === KeyCodeStrings.ESC) {
      context.placeholder.hide();
      return new IdleState(context);
    }
    return this;
  }

  protected onDragOut (context: Editor, input: EditorMouseInput, delta: Vector2): void {
    /*
    context.selectedNodes.forEach((node) => {
      node.move(delta.x, delta.y);
    });
    */
  }

  private addNode (context: Editor) {
    const position = context.placeholder.position;
    const op = new AddNodeOperation(this.nodeConstructor, position);
    context.pushHistory(op).do(context);
    context.placeholder.hide();
  }
}
