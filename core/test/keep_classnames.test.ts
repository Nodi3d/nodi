
import { v4 } from 'uuid';
import { NPoint } from '~/src/math/geometry/NPoint';
import { Addition } from '~/src/nodes/math/operator/Addition';

describe('keep classnames', (): void => {
  test('node', (done) => {
    const n = new Addition(v4());
    expect(n.constructor.name).toBe('Addition');
    done();
  });
  test('math', (done) => {
    const p = new NPoint();
    expect(p.constructor.name).toBe('NPoint');
    done();
  });
});
