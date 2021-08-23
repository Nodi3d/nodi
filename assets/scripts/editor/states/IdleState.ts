import KeyCodes, { KeyCodeStrings } from '../misc/KeyCodes';
import Editor, { EditorMouseInput } from '../Editor';
import InputUtils from '../misc/InputUtils';
import GroupView from '../views/GroupView';
import IOView from '../views/IOView';
import NodeView from '../views/NodeView';
import ConnectIOState from './ConnectIOState';
import DisconnectIOState from './DisconnectIOState';
import MultipleSelectNodeState from './MultipleSelectNodeState';
import SelectGroupState from './SelectGroupState';
import SelectKeepNodeState from './SelectKeepNodeState';
import SelectNodeState from './SelectNodeState';
import StateBase from './StateBase';

export default class IdleState extends StateBase {
  public mouseDown (context: Editor, input: EditorMouseInput): StateBase {
    context.prepareMousePosition(input.position);

    switch (input.which) {
      case 0: // no button (0 touch)
      case 1: // left click
      {
        if (input.event.ctrlKey || input.event.metaKey) {
          return new DisconnectIOState(context);
        } else {
          return new MultipleSelectNodeState(context, input);
        }
      }
    }

    return this;
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    return this;
  }

  public mouseUp (context: Editor, input: EditorMouseInput): StateBase {
    return this;
  }

  public keyDown (context: Editor, e: KeyboardEvent): StateBase {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === KeyCodeStrings.a) {
        context.selectAllNodes();
        return new SelectKeepNodeState(context);
      }
    }

    return this;
  }

  public keyUp (context: Editor, e: KeyboardEvent): StateBase {
    return this;
  }

  public selectNodeView (context: Editor, view: NodeView): StateBase {
    return new SelectNodeState(context, view);
  }

  public clickNodeView (context: Editor, view: NodeView): StateBase {
    return this;
  }

  public contextNodeView (context: Editor, view: NodeView): StateBase {
    return this;
  }

  public mouseOverIOView (context: Editor, view: IOView): StateBase {
    view.getIO().select();
    return this;
  }

  public mouseOutIOView (context: Editor, view: IOView): StateBase {
    view.getIO().unselect();
    return this;
  }

  public mouseDownIOView (context: Editor, ioView: IOView): StateBase {
    return new ConnectIOState(context, ioView);
  }

  public mouseUpIOView (context: Editor, view: IOView): StateBase {
    return this;
  }

  public selectGroupView (context: Editor, view: GroupView): StateBase {
    return new SelectGroupState(context, view);
  }
}
