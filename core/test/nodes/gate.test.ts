
import { v4 } from 'uuid';
import { Graph } from '~/src/Graph';
import { Equality } from '~/src/nodes/math/operator/Equality';
import { GateAnd } from '~/src/nodes/math/operator/GateAnd';
import { UINumber } from '~/src/nodes/params/ui/UINumber';

describe('gate', (): void => {
  test('and, or, not', (done) => {
    const graph = new Graph();
    const number = (graph.addNode(v4(), UINumber) as UINumber).setNumberValue(5);
    const number2 = (graph.addNode(v4(), UINumber) as UINumber).setNumberValue(10);
    const equality = graph.addNode(v4(), Equality);
    const equality2 = graph.addNode(v4(), Equality);
    graph.connectIO(number, 0, equality, 0);
    graph.connectIO(number, 0, equality, 1);
    graph.connectIO(number, 0, equality2, 0);
    graph.connectIO(number2, 0, equality2, 1);

    const and = graph.addNode(v4(), GateAnd);
    graph.connectIO(equality, 0, and, 0);
    graph.connectIO(equality2, 0, and, 1);

    graph.onFinishProcess.on(() => {
      {
        const result = equality.outputManager.getOutput(0).getData()?.getItemsByIndex(0)[0];
        expect(result).toBe(true);
      }

      {
        const result = equality2.outputManager.getOutput(0).getData()?.getItemsByIndex(0)[0];
        expect(result).toBe(false);
      }

      {
        const result = and.outputManager.getOutput(0).getData()?.getItemsByIndex(0)[0];
        expect(result).toBe(false);
      }

      done();
    });
  });
});
