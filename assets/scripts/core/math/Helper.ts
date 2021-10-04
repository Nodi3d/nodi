import { Vector3 } from 'three';

export default {

  clamp (value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    }

    return value;
  },

  clamp01 (value: number): number {
    return this.clamp(value, 0, 1);
  },

  lerp (value1: number, value2: number, amount: number): number {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
  },

  randomRange (min: number, max: number): number {
    return min + (max - min) * Math.random();
  },

  normalFrom3Points (a: Vector3, b: Vector3, c: Vector3): Vector3 {
    const bc = (new Vector3()).subVectors(c, b);
    const ba = (new Vector3()).subVectors(a, b);
    return bc.cross(ba).normalize();
  }

};
