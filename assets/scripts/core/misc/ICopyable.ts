
export default interface ICopyable {

  copy(source: this): this;

}

export const isCopyable = function (arg: any): arg is ICopyable {
  return 'copy' in arg;
};
