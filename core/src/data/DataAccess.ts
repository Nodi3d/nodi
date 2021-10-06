import { AccessType, AccessTypes } from './AccessTypes';
import { DataPath } from './DataPath';
import { DataTree } from './DataTree';

export class DataAccess {
  protected index: number;
  protected path: DataPath;
  protected inAccesses: AccessType[];
  protected inValues: any[];
  protected outAccesses: AccessType[];
  protected outValues: any[] = [];

  constructor (index: number, path: DataPath, inAccesses: AccessType[] = [], inValues: any[] = [], outAccesses: AccessType[] = []) {
    this.index = index;
    this.path = path;
    this.inAccesses = inAccesses;
    this.inValues = inValues;
    this.outAccesses = outAccesses;
    this.outValues = outAccesses.map(_ => undefined);
  }

  public getIndex (): number {
    return this.index;
  }

  public getPath (): DataPath {
    return this.path;
  }

  public getOutValues (): any[] {
    return this.outValues;
  }

  public getAccessType (index: number): AccessType {
    if (index >= this.inAccesses.length) { throw new Error(`${index} is out of bounds`); }
    return this.inAccesses[index];
  }

  public getData (index: number): any {
    if (index >= this.inAccesses.length) { throw new Error(`${index} is out of bounds`); }
    if (this.inAccesses[index] !== AccessTypes.ITEM) { throw new Error(`${index} is not item`); }
    return this.inValues[index];
  }

  public getDataList (index: number): any[] {
    if (index >= this.inAccesses.length) { throw new Error(`${index} is out of bounds`); }
    if (this.inAccesses[index] !== AccessTypes.LIST) { throw new Error(`${index} is not list`); }
    return this.inValues[index];
  }

  public getDataTree (index: number): DataTree {
    if (index >= this.inAccesses.length) { throw new Error(`${index} is out of bounds`); }
    if (this.inAccesses[index] !== AccessTypes.TREE) { throw new Error(`${index} is not tree`); }
    return this.inValues[index] as DataTree;
  }

  public getInputCount (): number {
    return this.inAccesses.length;
  }

  public setData (index: number, value: any): void {
    if (index >= this.outAccesses.length) { throw new Error(`${index} is out of bounds`); }
    if (this.outAccesses[index] !== AccessTypes.ITEM) { throw new Error(`${index} is not item`); }
    this.outValues[index] = value;
  }

  public setDataList (index: number, value: any[]): void {
    if (index >= this.outAccesses.length) { throw new Error(`${index} is out of bounds`); }
    if (this.outAccesses[index] !== AccessTypes.LIST) { throw new Error(`${index} is not list`); }
    this.outValues[index] = value;
  }

  public setDataTree (index: number, value: DataTree): void {
    if (index >= this.outAccesses.length) { throw new Error(`${index} is out of bounds`); }
    if (this.outAccesses[index] !== AccessTypes.TREE) { throw new Error(`${index} is not tree`); }
    this.outValues[index] = value;
  }

  public getOutputCount (): number {
    return this.outAccesses.length;
  }
}
