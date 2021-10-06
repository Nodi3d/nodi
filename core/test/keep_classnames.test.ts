
import { v4 } from 'uuid';
import { Addition } from '~/src/nodes/math/operator/Addition';
import { getNodeConstructorNameOfInstance } from '~/src/nodes/NodeUtils';

describe('keep classnames', (): void => {
  test('node', (done) => {
    const n = new Addition(v4());
    const name = getNodeConstructorNameOfInstance(n);
    expect(name).toBe('Addition');
    done();
  });
});
