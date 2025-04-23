// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { createExpressMiddleware } from '@trpc/server/adapters/express';

import cors from 'cors';
import express from 'express';
import { describe, expect, it } from 'vitest';

import { IoClient } from '../src/io-client';
import { ioRouter } from '../src/io-router';

describe('io-client', () => {
  it('should be able to create a client', async () => {
    const app = express();

    app.use(cors({ origin: 'http://localhost:3000' }));
    app.use('/trpc', createExpressMiddleware({ router: ioRouter }));
    const server = app.listen(3000);
    server.on('listening', async () => {
      console.log('Server is running on http://localhost:3000/trpc');
    });
    server.on('error', (err) => {
      console.error('Server error:', err);
      server.close();
    });

    // Create an instance of the IoClient
    const client = new IoClient();
    expect(client).toBeDefined();
    const result = await client.greeting();
    expect(result).toBe('hello tRPC v10!');

    server.closeAllConnections();
    server.close();
  });
});
