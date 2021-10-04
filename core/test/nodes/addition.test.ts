
import { v4 } from 'uuid';
import { Graph } from '~/src/Graph';
import { Addition } from '~/src/nodes/math/operator/Addition';
import { UINumber } from '~/src/nodes/params/ui/UINumber';
describe('addition', (): void => {
  test('1 + 1', (done) => {
    const graph = new Graph();
    const number0 = graph.addNode(v4(), UINumber, 0, 0) as UINumber;
    number0.setNumberValue(1);

    const number1 = graph.addNode(v4(), UINumber, 0, 100) as UINumber;
    number1.setNumberValue(1);

    const addition = graph.addNode(v4(), Addition, 0, 0) as Addition;
    graph.connectIO(number0, 0, addition, 0);
    graph.connectIO(number1, 0, addition, 1);

    graph.onFinishProcess.on(() => {
      const output = addition.outputManager.getOutput(0);
      const data = output.getData();
      const items = data?.getItemsByIndex(0);
      expect(items).not.toBe(undefined);
      expect((items as any[]).length).toBe(1);
      expect((items as any[])[0]).toBe(2);
      done();
    });
  });
});
