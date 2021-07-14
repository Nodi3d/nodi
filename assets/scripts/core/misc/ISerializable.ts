
export default interface ISerializable {

  toJSON(): any;
  fromJSON(json: any): void;

}
