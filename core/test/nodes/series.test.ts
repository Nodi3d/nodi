
import { v4 } from 'uuid';
import { Branch } from '~/src/data/Branch';
import { Graph } from '~/src/Graph';
import { Series } from '~/src/nodes/sets/sequence/Series';

describe('series', (): void => {
  test('single', (done) => {
    const graph = new Graph();
    const series = graph.addNode(v4(), Series, 0, 0) as Series;
    graph.onFinishProcess.on(() => {
      const output = series.outputManager.getOutput(0);
      const data = output.getData();

      const branch = data?.getBranchByIndex(0) as Branch;
      const key = branch?.getPath().key as string;
      expect(key).toBe('0;0');

      const value = branch?.getValue();
      expect(value).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

      done();
    });
  });

  test('nested', (done) => {
    const graph = new Graph();
    const series = graph.addNode(v4(), Series, 0, 0) as Series;
    const series2 = graph.addNode(v4(), Series, 100, 0) as Series;
    const series3 = graph.addNode(v4(), Series, 200, 0) as Series;

    graph.connectIO(series, 0, series2, 0);
    graph.connectIO(series2, 0, series3, 0);

    graph.onFinishProcess.on(() => {
      {
        // test series2 pathes & values
        const output = series2.outputManager.getOutput(0);
        const data = output.getData();
        const count = data?.getBranchCount() as number;
        for (let idx = 0; idx < count; idx++) {
          const branch = data?.getBranchByIndex(idx) as Branch;
          const key = branch.getPath().key;
          expect(key).toBe(`0;0;${idx}`);
          const value = branch.getValue();
          expect(value).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => i + idx));
        }
      }

      {
        // test series3 pathes
        const output = series3.outputManager.getOutput(0);
        const data = output.getData();
        const count = data?.getBranchCount() as number;

        for (let idx = 0; idx < count; idx++) {
          const branch = data?.getBranchByIndex(idx) as Branch;
          const key = branch.getPath().key;
          const n1 = Math.floor(idx / 10);
          const n2 = idx - n1 * 10;
          expect(key).toBe(`0;0;${n1};${n2}`);
        }
      }

      done();
    });
  });
});
