import { Vector2 } from 'three';
import Editor, { EditorMouseInput } from '../Editor';
import StateBase from './StateBase';

export default abstract class DragOutScreenStateBase extends StateBase {
  protected interval: NodeJS.Timeout | null = null;

  protected abstract onDragOut(context: Editor, input: EditorMouseInput, delta: Vector2): void;

  public mouseOut (context: Editor, input: EditorMouseInput): StateBase {
    const r = input.rect;
    const offset = 10;
    const dx = (input.position.x < offset) ? -1 : ((input.position.x > r.width - offset) ? 1 : 0);
    const dy = (input.position.y < offset) ? -1 : ((input.position.y > r.height - offset) ? 1 : 0);
    const scale = context.scale;
    const dir = new Vector2(dx, dy).multiplyScalar(scale * 5.0);

    this.clearInterval();
    this.interval = setInterval(
      () => {
        context.pan(-dir.x, -dir.y);
        const delta = dir.clone().multiplyScalar(1 / scale);
        this.onDragOut(context, input, delta);
      },
      1
    );
    return this;
  }

  public mouseOver (context: Editor, input: EditorMouseInput): StateBase {
    this.clearInterval();
    return this;
  }

  protected clearInterval (): void {
    if (this.interval !== null) { clearInterval(this.interval); }
    this.interval = null;
  }

  public dispose (): void {
    super.dispose();
    this.clearInterval();
  }
}
