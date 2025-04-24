// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { createTRPCClient, httpBatchLink } from '@trpc/client';


import type { IoRouter } from './io-router.ts';

export class IoClient {
  private _client: ReturnType<typeof createTRPCClient<IoRouter>>;

  constructor() {
    // Initialize the tRPC client
    this._client = createTRPCClient<IoRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
        }),
        // splitLink({
        //   condition: (op) => op.type === 'subscription',
        //   true: httpSubscriptionLink({
        //     url: 'http://localhost:3000/trpc',
        //     // transformer,
        //   }),
        //   false: httpBatchStreamLink({
        //     url: 'http://localhost:3000/trpc',
        //     // transformer,
        //   }),
        // }),
      ],
    });
  }

  public async greeting(): Promise<string> {
    try {
      // Call the greeting query on the tRPC client
      const result = await this._client.greeting.query();
      return result;
    } catch (error) {
      console.error('Error calling greeting query:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  public async sayHi(): Promise<string> {
    // Call the greeting query on the tRPC client
    const result = await this._client.sayHi.query();
    return result;
  }

  public async byId(id: number): Promise<{ id: number; name: string }> {
    // Call the greeting query on the tRPC client
    const result = (await this._client.byId.query(id)) as {
      id: number;
      name: string;
    };
    return result;
  }
}
