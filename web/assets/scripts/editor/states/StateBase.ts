import { IDisposable } from '@nodi/core';
import Editor, { EditorMouseInput } from '../Editor';
import GroupView from '../views/GroupView';
import IOView from '../views/IOView';
import NodeView from '../views/NodeView';

export default abstract class StateBase implements IDisposable {
  // eslint-disable-next-line no-useless-constructor
  constructor (context: Editor) {
  }

  public mouseDown (context: Editor, input: EditorMouseInput): StateBase {
    return this;
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    return this;
  }

  public mouseUp (context: Editor, input: EditorMouseInput): StateBase {
    return this;
  }

  public mouseOver (context: Editor, input: EditorMouseInput): StateBase {
    return this;
  }

  public mouseOut (context: Editor, input: EditorMouseInput): StateBase {
    return this;
  }

  public keyDown (context: Editor, e: KeyboardEvent): StateBase {
    return this;
  }

  public keyUp (context: Editor, e: KeyboardEvent): StateBase {
    return this;
  }

  public selectNodeView (context: Editor, view: NodeView): StateBase {
    return this;
  }

  public clickNodeView (context: Editor, view: NodeView): StateBase {
    return this;
  }

  public contextNodeView (context: Editor, view: NodeView): StateBase {
    return this;
  }

  public mouseOverIOView (context: Editor, view: IOView): StateBase {
    return this;
  }

  public mouseOutIOView (context: Editor, view: IOView): StateBase {
    return this;
  }

  public mouseDownIOView (context: Editor, ioView: IOView): StateBase {
    return this;
  }

  public mouseUpIOView (context: Editor, view: IOView): StateBase {
    return this;
  }

  public selectGroupView (context: Editor, view: GroupView): StateBase {
    return this;
  }

  public destroy (context: Editor): void {
  }

  public dispose (): void {
  }
}
