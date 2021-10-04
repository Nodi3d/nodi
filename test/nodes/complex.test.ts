import { v4 } from 'uuid';
import Graph from '../../assets/scripts/core/Graph';
import Complex from '../../assets/scripts/core/nodes/math/complex/Complex';
import Addition from '../../assets/scripts/core/nodes/math/operator/Addition';
import Multiplication from '../../assets/scripts/core/nodes/math/operator/Multiplication';
import ComplexConjugate from '../../assets/scripts/core/nodes/math/complex/ComplexConjugate';
import ComplexModulus from '../../assets/scripts/core/nodes/math/complex/ComplexModulus';
import DeconstructComplex from '../../assets/scripts/core/nodes/math/complex/DeconstructComplex';
import Subtration from '../../assets/scripts/core/nodes/math/operator/Subtraction';
import UINumber from '../../assets/scripts/core/nodes/params/ui/UINumber';
import NComplexNumber from '../../assets/scripts/core/math/primitive/NComplexNumber';

describe('complex', (): void => {
  test('operators', (done) => {
    const graph = new Graph();
    const number0 = graph.addNode(v4(), UINumber) as UINumber;
    number0.setNumberValue(10);

    const number1 = graph.addNode(v4(), UINumber) as UINumber;
    number1.setNumberValue(2);

    const number2 = graph.addNode(v4(), UINumber) as UINumber;
    number2.setNumberValue(4);

    const complex = graph.addNode(v4(), Complex) as Complex;
    graph.connectIO(number0, 0, complex, 0);
    graph.connectIO(number1, 0, complex, 1);

    const addition = graph.addNode(v4(), Addition) as Addition;
    graph.connectIO(complex, 0, addition, 0);
    graph.connectIO(number2, 0, addition, 1);

    const multiplication = graph.addNode(v4(), Multiplication) as Multiplication;
    graph.connectIO(complex, 0, multiplication, 0);
    graph.connectIO(number2, 0, multiplication, 1);

    const subtraction = graph.addNode(v4(), Subtration);
    graph.connectIO(addition, 0, subtraction, 0);
    graph.connectIO(multiplication, 0, subtraction, 1);

    const conj = graph.addNode(v4(), ComplexConjugate);
    graph.connectIO(complex, 0, conj, 0);

    const mod = graph.addNode(v4(), ComplexModulus);
    graph.connectIO(complex, 0, mod, 0);

    const decon = graph.addNode(v4(), DeconstructComplex);
    graph.connectIO(complex, 0, decon, 0);

    graph.onFinishProcess.on(() => {
      {
        const output = addition.outputManager.getOutput(0);
        const data = output.getData();
        const items = data?.getItemsByIndex(0) as any[];
        expect(items.length).toBe(1);

        const item = items[0] as NComplexNumber;
        expect(item.real).toBe(14);
        expect(item.imag).toBe(2);
      }

      {
        const output = multiplication.outputManager.getOutput(0);
        const data = output.getData();
        const items = data?.getItemsByIndex(0) as any[];
        expect(items.length).toBe(1);

        const item = items[0] as NComplexNumber;
        expect(item.real).toBe(40);
        expect(item.imag).toBe(8);
      }

      {
        const output = subtraction.outputManager.getOutput(0);
        const data = output.getData();
        const items = data?.getItemsByIndex(0) as any[];
        expect(items.length).toBe(1);

        const item = items[0] as NComplexNumber;
        expect(item.real).toBe(-26);
        expect(item.imag).toBe(-6);
      }

      {
        const output = conj.outputManager.getOutput(0);
        const item = output.getData()?.getItemsByIndex(0)[0] as NComplexNumber;
        expect(item.real).toBe(10);
        expect(item.imag).toBe(-2);
      }

      {
        const output = mod.outputManager.getOutput(0);
        const item = output.getData()?.getItemsByIndex(0)[0];
        expect(item).toBe(Math.sqrt(10 * 10 + 2 * 2));
      }

      {
        const items0 = decon.outputManager.getOutput(0).getData()?.getItemsByIndex(0) as number[];
        const items1 = decon.outputManager.getOutput(1).getData()?.getItemsByIndex(0) as number[];
        expect(items0[0]).toBe(10);
        expect(items1[0]).toBe(2);
      }

      done();
    });
  });
});
