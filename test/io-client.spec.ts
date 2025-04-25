// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { IoMem } from '@rljson/io';
// import { IoSqlite } from '@rljson/io-sqlite';
import { exampleTableCfg, Rljson, TableCfg } from '@rljson/rljson';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import cors from 'cors';
import express from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { IoClient } from '../src/io-client';
import { ioRouter } from '../src/io-router';

let server: ReturnType<(typeof express)['application']['listen']>;
let client: IoClient;

beforeEach(() => {
  // Run server with context
  const app = express();
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: ioRouter,
      createContext: () => {
        const io = new IoMem();
        // const io = new IoSqlite();
        return {
          io,
        };
      },
    }),
  );
  server = app.listen(3000);

  // Create an instance of the IoClient
  client = new IoClient();
});

afterEach(() => {
  server.closeAllConnections();
  server.close();
});

describe('io-client', () => {
  it('should be able to create a client', async () => {
    expect(client).toBeDefined();
  });

  it('should return ioDump', async () => {
    const result = await client.ioDump();
    expect(result).toBeDefined();
  });

  it('should return ioDumpTable', async () => {
    const result = await client.ioDumpTable({ table: 'revisions' });
    expect(result.revisions._tableCfg).toEqual('KK7MV6tta9SVVZx_GSP3Dg');
    expect(result.revisions._type).toEqual('ingredients');
    console.log(JSON.stringify(result, null, 2));
  });

  it('should create a table', async () => {
    const tableCfg: TableCfg = hip(exampleTableCfg({ key: 'test' }));
    const res1 = await client.createTable({ tableCfg: tableCfg });

    const result = await client.ioDumpTable({ table: 'test' });

    expect(result).toEqual('test');
  });

  it('should return ioTableCfgs', async () => {
    const result = await client.ioTableCfgs();
    expect(result.tableCfgs._data.length).toEqual(2);
  });

  it('should return allTableNames', async () => {
    const result = await client.allTableNames();
    expect(result).toEqual(['tableCfgs', 'revisions']);
  });

  it('should write data', async () => {
    let inputValue: Rljson = {
      tableA: {
        _type: 'ingredients',
        _data: [{ key: 'keyA2', value: 'a2' }],
      },
    };
    await client.write({ data: inputValue });
    const data = {
      table: 'revisions',
      where: { id: 'test' },
    };
    const result = await client.readRows(data);
  });

  it('should read rows', async () => {
    const data = {
      table: 'tableCfgs',
      where: { type: 'ingredients' },
    };
    const result = await client.readRows(data);
    expect(result.tableCfgs._data.length).toEqual(2);
  });
});
