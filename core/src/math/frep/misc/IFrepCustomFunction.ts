
export interface IFrepCustomFunction {
  fn(): string
}

const isFrepCustomFunction = function (arg: any): arg is IFrepCustomFunction {
  return arg !== null && typeof arg === 'object' && typeof arg.fn === 'function';
};

export {
  isFrepCustomFunction 
};
