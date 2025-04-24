// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { IoMem } from '@rljson/io';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import cors from 'cors';
import express from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { IoClient } from '../src/io-client';
import { ioRouter } from '../src/io-router';

let server: ReturnType<(typeof express)['application']['listen']>;

beforeEach(() => {
  const app = express();
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: ioRouter,
      createContext: () => {
        const io = new IoMem();
        return {
          io,
        };
      },
    }),
  );
  server = app.listen(3000);
});

afterEach(() => {
  server.closeAllConnections();
  server.close();
});

describe('io-client', () => {
  it('should be able to create a client', async () => {
    // Create an instance of the IoClient
    const client = new IoClient();
    expect(client).toBeDefined();
  });

  it('should return a static value', async () => {
    // Create an instance of the IoClient
    const client = new IoClient();
    const result = await client.greeting();
    expect(result).toBe('hello tRPC v10!');
  });

  it('should return another static value', async () => {
    // Create an instance of the IoClient
    const client = new IoClient();
    const result = await client.sayHi();
    expect(result).toBe('Hello there!');
  });

  it('should return a value by ID', async () => {
    // Create an instance of the IoClient
    const client = new IoClient();
    const id = 1; // Example ID
    const result = await client.byId(id);
    expect(result).toEqual({ id, name: 'user name' });
  });

  it('should return an iterable', async () => {
    // Create an instance of the IoClient
    const client = new IoClient();
    const iterable = client.iterable();
    const results: string[] = [];

    for await (const value of await iterable) {
      results.push(value);
    }

    expect(results).toEqual(['First update', 'Second update', 'Third update']);
  });

  it('should return ioDump', async () => {
    // Create an instance of the IoClient
    const client = new IoClient();
    const result = await client.ioDump();
    expect(result).toBeDefined();
  });
});
