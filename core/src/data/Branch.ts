import { isCopyable } from '../misc/ICopyable';
import { ISerializable } from '../misc/ISerializable';
import { DataPath } from './DataPath';

export type BranchJSONType = {
  path: number[];
  value: any[];
};

export class Branch implements ISerializable {
  protected path: DataPath;
  protected value: any[];

  constructor (path: DataPath, value: any[] = []) {
    this.path = path;
    this.value = value;
  }

  public getCount (): number {
    return this.value.length;
  }

  public getPath (): DataPath {
    return this.path;
  }

  public setValue (value: any[]): void {
    this.value = value;
  }

  public getValue (): any[] {
    return this.value;
  }

  public clone (): Branch {
    return new Branch(this.path.clone(), this.value.slice());
  }

  toJSON (): BranchJSONType {
    return {
      path: this.path.indices,
      value: this.value
    };
  }

  fromJSON (json: BranchJSONType): void {
    this.path = new DataPath(json.path);

    // TODO: deserialize class from json object
    if (this.value.length === json.value.length) {
      // copy
      this.value.forEach((value, index) => {
        const source = json.value[index];
        if (source === null) { return; }

        const t = typeof (source);
        switch (t) {
          case 'object': {
            if (isCopyable(value)) {
              value.copy(source);
            }
            break;
          }
          default: {
            this.value[index] = source;
            break;
          }
        }
      });
    }
  }
}
