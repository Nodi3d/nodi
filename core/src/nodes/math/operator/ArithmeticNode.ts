
import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NComplexNumber } from '../../../math/primitive/NComplexNumber';
import { NodeBase } from '../../NodeBase';

type ArithmeticType = number | Vector3 | NComplexNumber;

export abstract class ArithmeticNode extends NodeBase {
  abstract get realOnly(): boolean;

  public registerInputs (manager: InputManager): void {
    const type = DataTypes.NUMBER | DataTypes.COMPLEX | DataTypes.VECTOR;
    manager.add('a', 'First item for operation', type, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('b', 'Second item for operation', type, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
  }

  public registerOutputs (manager: OutputManager): void {
    const type = DataTypes.NUMBER | DataTypes.COMPLEX | DataTypes.VECTOR;
    manager.add('R', 'The result of operation', type, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const v0 = access.getData(0);
    const v1 = access.getData(1);

    let result: ArithmeticType;
    if (v0 instanceof NComplexNumber || v1 instanceof NComplexNumber) {
      result = this.calculateNumberOrComplex(v0, v1);
    } else {
      result = this.calculateNumberOrVector3(v0, v1);
    }
    access.setData(0, result);
  }

  protected calculateNumberOrVector3 (i0: number | Vector3, i1: number | Vector3): ArithmeticType {
    i0 = (i0 === undefined) ? 0 : i0;
    i1 = (i1 === undefined) ? 0 : i1;

    const isv0 = (i0 instanceof Vector3);
    const isv1 = (i1 instanceof Vector3);
    if (isv0) {
      i0 = i0 as Vector3;
      if (isv1) {
        i1 = i1 as Vector3;
        return new Vector3(
          this.calculateNumberNumber(i0.x, i1.x),
          this.calculateNumberNumber(i0.y, i1.y),
          this.calculateNumberNumber(i0.z, i1.z)
        );
      } else {
        i1 = i1 as number;
        return new Vector3(
          this.calculateNumberNumber(i0.x, i1),
          this.calculateNumberNumber(i0.y, i1),
          this.calculateNumberNumber(i0.z, i1)
        );
      }
    } else if (isv1) {
      i0 = i0 as number;
      i1 = i1 as Vector3;
      return new Vector3(
        this.calculateNumberNumber(i0, i1.x),
        this.calculateNumberNumber(i0, i1.y),
        this.calculateNumberNumber(i0, i1.z)
      );
    }

    i0 = i0 as number;
    i1 = i1 as number;
    return this.calculateNumberNumber(i0, i1);
  }

  calculateNumberOrComplex (i0: number | NComplexNumber, i1: number | NComplexNumber): ArithmeticType {
    i0 = (i0 === undefined) ? 0 : i0;
    i1 = (i1 === undefined) ? 0 : i1;

    const isc0 = (i0 instanceof NComplexNumber);
    const isc1 = (i1 instanceof NComplexNumber);

    if (isc0) {
      i0 = i0 as NComplexNumber;
      if (isc1) {
        // c method
        return this.calculateComplexComplex(i0, i1 as NComplexNumber);
      } else {
        i1 = i1 as number;
        if (this.realOnly) {
          return new NComplexNumber(
            this.calculateNumberNumber(i0.real, i1),
            i0.imag
          );
        } else {
          return new NComplexNumber(
            this.calculateNumberNumber(i0.real, i1),
            this.calculateNumberNumber(i0.imag, i1)
          );
        }
      }
    } else if (isc1) {
      i0 = i0 as number;
      i1 = i1 as NComplexNumber;
      if (this.realOnly) {
        return new NComplexNumber(
          this.calculateNumberNumber(i0, i1.real),
          i1.imag
        );
      } else {
        return new NComplexNumber(
          this.calculateNumberNumber(i0, i1.real),
          this.calculateNumberNumber(i0, i1.imag)
        );
      }
    }

    return this.calculateNumberNumber(i0 as number, i1 as number);
  }

  protected abstract calculateNumberNumber(i0: number, i1: number): number;
  protected abstract calculateComplexComplex(i0: NComplexNumber, i1: NComplexNumber): NComplexNumber;
}
