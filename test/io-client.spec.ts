// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip, hsh } from '@rljson/hash';
import { IoMem } from '@rljson/io';
// import { IoSqlite } from '@rljson/io-sqlite';
import { exampleTableCfg, Rljson, TableCfg } from '@rljson/rljson';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import cors from 'cors';
import express from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { IoClient } from '../src/io-client';
import { ioRouter } from '../src/io-router';

import { expectGolden } from './setup/goldens.ts';

const fs = require('fs');
const path = require('path');

let server: ReturnType<(typeof express)['application']['listen']>;
let client: IoClient;

beforeEach(async () => {
  // Run server with context
  const io = new IoMem();
  await io.init();
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
  //await client.isReady();
});

afterEach(() => {
  server.closeAllConnections();
  server.close();
});

describe('io-client', () => {
  it('should be able to create a client', async () => {
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(IoClient);
    expect(client['_clientRouter']).toBeDefined();
    expect(client['_ioTools']).toBeDefined();
  });

  it('should return ioDump', async () => {
    const result = await client.dump();
    expect(result._hash).toEqual('h9UNtoBx3lvHU4yzAyz10M');
  });

  it('should return dumpTable', async () => {
    const result = await client.dumpTable({ table: 'tableCfgs' });
    await expectGolden('tableCfgs.json').toBe(result);
  });

  it('should create a table', async () => {
    const tableCfg: TableCfg = hip(exampleTableCfg({ key: 'table1' }));
    await client.createOrExtendTable({ tableCfg: tableCfg });
    const result = await client.dumpTable({ table: 'table1' });
    await expectGolden('table1.json').toBe(result);
  });

  it('should return tableCfgs', async () => {
    const result = await client.tableCfgs();
    expect(result.tableCfgs._data.length).toEqual(2);
  });

  // it('should return allTableNames', async () => {
  //   const result = await client.allTableNames();
  //   expect(result).toEqual(['tableCfgs', 'revisions']);
  // });

  it('should write data', async () => {
    // create a table first
    const tableCfg: TableCfg = hip(exampleTableCfg({ key: 'tableA' }));
    await client.createOrExtendTable({ tableCfg: tableCfg });

    // create content
    const inputValue: Rljson = {
      tableA: {
        _type: 'ingredients',
        _data: [
          {
            a: 'aa',
            b: 9,
          },
        ],
      },
    };
    const hashedValue = hsh(inputValue); // hash the input value

    // write content
    await client.write({ data: hashedValue });

    // dump table to check if data is written
    const resdump = await client.dumpTable({ table: 'tableA' });
    expect(resdump.tableA._data.length).toEqual(1);

    // check if data is written correctly
    const data = {
      table: 'tableA',
      where: { a: 'aa' },
    };
    const result = await client.readRows(data);
    expect(result.tableA._data.length).toEqual(1);
    expect(result.tableA._data[0].a).toEqual('aa');
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
