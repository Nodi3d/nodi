
import { Vector2 } from 'three';

const InputUtils = {
  getTouchPosition (e: TouchEvent, prev: Vector2 = new Vector2()): Vector2 {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      return new Vector2(touch.clientX, touch.clientY);
    }
    return prev;
  },
  getMouseWhich (e: MouseEvent | TouchEvent) {
    if (e instanceof TouchEvent) {
      const len = e.touches.length;
      return len;
    }
    return e.which;
  }
};

export default InputUtils;
