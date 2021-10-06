import { Matrix4 } from 'three';
import { NPoint } from './NPoint';

export type TransformerType = (p: NPoint) => NPoint;

export interface ITransformable {
  applyMatrix(matrix: Matrix4): ITransformable;
  transform(f: TransformerType): ITransformable;
}

const isTransformable = function (arg: any): arg is ITransformable {
  return arg !== null && typeof arg === 'object' && typeof arg.applyMatrix === 'function';
};

export {
  isTransformable
};
