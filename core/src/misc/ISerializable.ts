
export interface ISerializable {

  toJSON(): any;
  fromJSON(json: any): void;

}
