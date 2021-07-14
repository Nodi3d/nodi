import Editor, { EditorMouseInput } from '../Editor';
import RectFigure from '../figures/RectFigure';
import NodeView from '../views/NodeView';
import IdleState from './IdleState';
import SelectKeepNodeState from './SelectKeepNodeState';
import StateBase from './StateBase';

export default class MultipleSelectNodeState extends StateBase {
  private rect: RectFigure = new RectFigure();

  constructor (context: Editor) {
    super(context);
    context.appendElement(this.rect.el);
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    const sp = context.getWorld(context.startMousePosition.x - input.rect.x, context.startMousePosition.y - input.rect.y);
    this.rect.update(sp.x, sp.y, input.world.x, input.world.y);
    return this;
  }

  public mouseUp (context: Editor, _input: EditorMouseInput): StateBase {
    let intersected: NodeView[] = [];

    // check just a left click
    const area = this.rect.area();
    if (area !== undefined && area > Number.EPSILON) {
      intersected = context.getCurrentGraphView().getNodes().filter((node) => {
        return this.rect.intersects(context, node);
      });
    }

    this.dispose();

    if (intersected.length > 0) {
      context.selectNodes(intersected.map(v => v.getNode()));
      return new SelectKeepNodeState(context);
    }

    context.unselectAllNodes();
    return new IdleState(context);
  }

  dispose (): void {
    super.dispose();
    this.rect.dispose();
  }
}
