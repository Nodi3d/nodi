import { Vector3 } from 'three';

export default interface IClosedCurve {
  contains(point: Vector3): boolean;
}

const isClosedCurve = function (arg: any): arg is IClosedCurve {
  return arg !== null && typeof arg === 'object' && typeof arg.contains === 'function';
};

export {
  isClosedCurve
};
