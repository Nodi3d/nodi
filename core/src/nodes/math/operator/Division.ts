import { NComplexNumber } from '../../../math/primitive/NComplexNumber';
import { ArithmeticNode } from './ArithmeticNode';

export class Division extends ArithmeticNode {
  get displayName (): string {
    return '÷';
  }

  get realOnly (): boolean {
    return false;
  }

  calculateNumberNumber (i0: number, i1: number): number {
    return i0 / i1;
  }

  calculateComplexComplex (i0: NComplexNumber, i1: NComplexNumber): NComplexNumber {
    return i0.div(i1);
  }
}
