
import { Vector2 } from 'three';

export interface IDraggable {
  position: Vector2;
  prevPosition: Vector2;
  prevMousePosition: Vector2;

  prepareDrag(e: MouseEvent): void;
  drag(e: MouseEvent, scale: number): void;

  moveTo(x: number, y: number): void;
  alignTo(x: number, y: number, r: number): void;
}
