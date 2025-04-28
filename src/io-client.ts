// @license
// Copyright (c) 2025 Rljson
//
import { Io } from '@rljson/io';
import { IsReady } from '@rljson/is-ready';
import { JsonValue } from '@rljson/json';
import { Rljson, TableCfg } from '@rljson/rljson';
//httpBatchLink,
import {
  createTRPCClient,
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
} from '@trpc/client';

import SuperJSON from 'superjson';

import type { IoRouter } from './io-router.ts';
export class IoClient implements Io {
  private _routerClient: ReturnType<typeof createTRPCClient<IoRouter>>;

  constructor() {
    // Initialize the tRPC client
    this._routerClient = createTRPCClient<IoRouter>({
      links: [
        // httpBatchLink({
        //   url: 'http://localhost:3000/trpc',
        // }),
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: 'http://localhost:3000/trpc',
            transformer: SuperJSON,
          }),
          false: httpBatchStreamLink({
            url: 'http://localhost:3000/trpc',
            transformer: SuperJSON,
          }),
        }),
      ],
    });
  }
  isReady(): Promise<void> {
    return this._isReady.promise;
  }
  dump(): Promise<Rljson> {
    return this._routerClient.ioDump.query();
  }

  dumpTable(request: { table: string }): Promise<Rljson> {
    return this._routerClient.ioDumpTable.query(request.table);
  }

  async createTable(request: { tableCfg: TableCfg }): Promise<void> {
    const tableCfg = request.tableCfg as TableCfg;
    await this._routerClient.ioCreateTable.mutate(tableCfg);
  }
  tableCfgs(): Promise<Rljson> {
    return this._routerClient.ioTableCfgs.query();
  }
  allTableNames(): Promise<string[]> {
    return this._routerClient.ioAllTableNames.query();
  }
  write(request: { data: Rljson }): Promise<void> {
    return this._routerClient.ioWrite.mutate(request.data);
  }
  readRows(request: {
    table: string;
    where: { [column: string]: JsonValue };
  }): Promise<Rljson> {
    return this._routerClient.ioReadRows.query(request);
  }

  private _isReady = new IsReady();
}
