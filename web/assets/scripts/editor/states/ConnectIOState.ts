import { Vector2 } from 'three';
import { Output } from '@nodi/core';
import Editor, { EditorMouseInput } from '../Editor';
import { DisconnectOperation, SequentialOperation } from '../operations';
import ConnectOperation, { ConnectOperationArg } from '../operations/ConnectOperation';
import IOView from '../views/IOView';
import DragOutScreenStateBase from './DragOutScreenStateBase';
import IdleState from './IdleState';
import StateBase from './StateBase';

export default class ConnectIOState extends DragOutScreenStateBase {
  constructor (context: Editor, ioView: IOView) {
    super(context);
    context.graphView.addConnectingEdge(ioView);
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    context.graphView.updateConnectingEdge(input.world);
    context.graphView.checkNearestIO(input.world);
    return this;
  }

  public mouseUp (context: Editor, input: EditorMouseInput): StateBase {
    const e = context.graphView.connectIOWithNearest(input.world);
    if (e !== undefined) {
      const arg = e as ConnectOperationArg;
      const dst = context.nodes.find(n => n.uuid === arg.dstNode);
      const dstI = dst?.inputManager.getInput(arg.dstI);
      if (dstI?.hasSource()) {
        const srcO = dstI.source;
        const srcNode = srcO?.getParent();
        const disconOp = new DisconnectOperation({
          srcNode: srcNode?.uuid as string,
          srcO: srcNode?.outputManager.getIOIndex(srcO as Output) as number,
          dstNode: dst?.uuid as string,
          dstI: dst?.inputManager.getIOIndex(dstI) as number
        });
        const conOp = new ConnectOperation(arg);
        const seqOp = new SequentialOperation([disconOp, conOp]);
        context.pushHistory(seqOp).do(context);
      } else {
        const conOp = new ConnectOperation(arg);
        context.pushHistory(conOp).do(context);
      }
    }

    context.graphView.removeConnectingEdge();
    return new IdleState(context);
  }

  protected onDragOut (context: Editor, input: EditorMouseInput, delta: Vector2): void {
    const world = context.getWorld(input.position.x, input.position.y);
    context.graphView.updateConnectingEdge(world);
  }
}
