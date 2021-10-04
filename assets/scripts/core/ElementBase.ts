import { Vector2 } from 'three';
import { ElementEvent } from './misc/Events';

export default abstract class ElementBase {
  uuid: string;

  protected position: Vector2 = new Vector2();
  protected prevPosition: Vector2 = new Vector2();
  onTransformed: ElementEvent = new ElementEvent();

  constructor (uuid: string) {
    this.uuid = uuid;
  }

  public getPrevPosition (): Vector2 {
    return this.prevPosition;
  }

  public getPosition (): Vector2 {
    return this.position;
  }

  public prepareTransform (): void {
    this.prevPosition.copy(this.position);
  }

  public move (dx: number, dy: number): void {
    this.moveTo(this.position.x + dx, this.position.y + dy);
  }

  public moveTo (x: number, y: number): void {
    this.position.set(x, y);
    this.transform();
  }

  public transform () {
    this.onTransformed.emit({ element: this });
  }
}
