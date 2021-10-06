import { KeyCodeStrings } from '../misc/KeyCodes';
import Editor, { EditorMouseInput } from '../Editor';
import NodeView from '../views/NodeView';
import IdleState from './IdleState';
import SelectNodeState from './SelectNodeState';
import StateBase from './StateBase';

export default class SelectKeepNodeState extends StateBase {
  public mouseUp (context: Editor, input: EditorMouseInput): StateBase {
    // left
    if (input.which === 1) {
      context.unselectAllNodes();
      return new IdleState(context);
    }

    if (!context.panning) {
      // Right click to show context menu
      if (input.which === 3) {
        context.onNodeContext.emit(input.event);
        return this;
      }

      context.unselectAllNodes();
      return new IdleState(context);
    }

    return this;
  }

  public keyUp (context: Editor, e: KeyboardEvent): StateBase {
    const key = e.key;
    if (
      (key === KeyCodeStrings.DELETE) ||
      (key === KeyCodeStrings.BACKSPACE)
    ) {
      context.removeSelectedNodesCmd();
      return new IdleState(context);
    }
    return this;
  }

  public selectNodeView (context: Editor, view: NodeView): StateBase {
    return new SelectNodeState(context, view);
  }
}
