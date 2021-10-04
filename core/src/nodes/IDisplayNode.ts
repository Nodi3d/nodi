import { IElementable } from '../misc/IElementable';

export interface IDisplayNode {

  display(): IElementable[];

}

const isDisplayNode = function (arg: any) : arg is IDisplayNode {
  return arg !== null && typeof arg === 'object' && typeof arg.display === 'function';
};

export {
  isDisplayNode
};
