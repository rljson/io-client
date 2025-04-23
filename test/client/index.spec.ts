import { createTRPCClient, httpBatchLink } from '@trpc/client';

import { describe, expect, it } from 'vitest';

import type { AppRouter } from '../../src/server/api.ts';

describe('TRPC Client', () => {
  it('should create a TRPC client with the correct configuration', async () => {
    const client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
        }),
      ],
    });

    const result = await client.sayHi.query();

    expect(result).toEqual('Hello there!');
  });
});
