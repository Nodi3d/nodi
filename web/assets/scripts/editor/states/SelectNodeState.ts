import { NodeBase } from '@nodi/core';
import Editor, { EditorMouseInput } from '../Editor';
import NodeView from '../views/NodeView';
import DragNodeState from './DragNodeState';
import StateBase from './StateBase';
import SelectKeepNodeState from './SelectKeepNodeState';

export default class SelectNodeState extends StateBase {
  constructor (context: Editor, view: NodeView) {
    super(context);
    this.selectNode(context, view.getNode());
  }

  protected selectNode (context: Editor, node: NodeBase) {
    node.select();
    if (!context.selectedNodes.includes(node)) {
      context.selectedNodes.push(node);
    }
    context.prepareSelectedNodes();
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    if (input.which === 1 && !context.panable(input.which, input.event.shiftKey)) { // CAUTION: Panningとバッティングしないようにする条件
      context.selectedNodes.forEach(n => n.prepareTransform());
      return new DragNodeState(context, input);
    }
    return this;
  }

  public selectNodeView (context: Editor, view: NodeView): StateBase {
    this.selectNode(context, view.getNode());
    return this;
  }

  public clickNodeView (context: Editor, view: NodeView): StateBase {
    return new SelectKeepNodeState(context);
  }
}
