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
  const io = new IoMem();
  const app = express();
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: ioRouter,
      createContext: () => {
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
    const result = await client.dump();
    expect(result).toBeDefined();
  });

  it('should return dumpTable', async () => {
    const result = await client.dumpTable({ table: 'revisions' });
    expect(result.revisions._tableCfg).toEqual('KK7MV6tta9SVVZx_GSP3Dg');
    expect(result.revisions._type).toEqual('ingredients');
    console.log(JSON.stringify(result, null, 2));
  });

  it('should create a table', async () => {
    const tableCfg: TableCfg = hip(exampleTableCfg({ key: 'test' }));
    await client.createTable({ tableCfg: tableCfg });

    const result = await client.dumpTable({ table: 'test' });

    expect(result.test).toBeDefined();
  });

  it('should return tableCfgs', async () => {
    const result = await client.tableCfgs();
    expect(result.tableCfgs._data.length).toEqual(2);
  });

  it('should return allTableNames', async () => {
    const result = await client.allTableNames();
    expect(result).toEqual(['tableCfgs', 'revisions']);
  });

  it('should write data', async () => {
    // create a table first
    const tableCfg: TableCfg = hip(exampleTableCfg({ key: 'tableA' }));
    await client.createTable({ tableCfg: tableCfg });

    // create content
    const inputValue: Rljson = {
      tableA: {
        _type: 'ingredients',
        _data: [{ key: 'keyA2', value: 'a2' }],
      },
    };

    // write content
    await client.write({ data: inputValue });

    // dump table to check if data is written
    const resdump = await client.dumpTable({ table: 'tableA' });
    expect(resdump.tableA._data.length).toEqual(1);

    // check if data is written correctly
    const data = {
      table: 'tableA',
      where: { key: 'keyA2' },
    };
    const result = await client.readRows(data);
    expect(result.tableA._data.length).toEqual(1);
    expect(result.tableA._data[0].key).toEqual('keyA2');
  });

  it('should read rows', async () => {
    const data = {
      table: 'tableCfgs',
      where: { type: 'ingredients' },
    };
    const result = await client.readRows(data);
    expect(result.tableCfgs._data.length).toEqual(2);
  });

  it('should resolve isReady', async () => {
    const readyPromise = client.isReady();
    client['_isReady'].resolve(); // Simulate readiness
    await expect(readyPromise).resolves.toBeUndefined();
  });
});
