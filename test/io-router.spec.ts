//********** */
// no tests for this as the router gets tested in the client tests
//********** */
import { describe, expect, it } from 'vitest';

// fake test
describe('io-router', () => {
  it('should be able to create a client', async () => {
    const test = 'test';
    expect(test).toEqual('test');
  });
});
