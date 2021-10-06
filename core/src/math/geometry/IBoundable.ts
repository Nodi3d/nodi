import { NBoundingBox } from './NBoundingBox';
import { NPlane } from './NPlane';

export interface IBoundable {
  bounds(plane: NPlane): NBoundingBox;
  area(): number;
}

const isBoundable = function (arg: any): arg is IBoundable {
  return arg !== null && typeof arg === 'object' && typeof arg.bounds === 'function';
};

export {
  isBoundable
};
