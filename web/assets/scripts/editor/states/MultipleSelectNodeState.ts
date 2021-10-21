import { Vector2 } from 'three';
import Editor, { EditorMouseInput } from '../Editor';
import RectFigure from '../figures/RectFigure';
import NodeView from '../views/NodeView';
import IdleState from './IdleState';
import SelectKeepNodeState from './SelectKeepNodeState';
import StateBase from './StateBase';

export default class MultipleSelectNodeState extends StateBase {
  private start: Vector2;
  private rect: RectFigure = new RectFigure();

  constructor (context: Editor, input: EditorMouseInput) {
    super(context);
    context.appendElement(this.rect.el);
    this.start = input.world;
  }

  public mouseMove (context: Editor, input: EditorMouseInput): StateBase {
    if (context.panning) {
      this.rect.dispose();
    }
    this.rect.update(this.start.x, this.start.y, input.world.x, input.world.y);
    return this;
  }

  public mouseUp (context: Editor, input: EditorMouseInput): StateBase {
    this.rect.update(this.start.x, this.start.y, input.world.x, input.world.y);

    let intersected: NodeView[] = [];

    // check just a left click
    const area = this.rect.area();
    if (area !== undefined && area > Number.EPSILON && !context.panning) {
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
