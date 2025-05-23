// @license
// Copyright (c) 2025 Rljson
//
import { Io, IoTools } from '@rljson/io';
import { IsReady } from '@rljson/is-ready';
import { JsonValue } from '@rljson/json';
import { Rljson, TableCfg, TableKey } from '@rljson/rljson';
//httpBatchLink,
import {
  createTRPCClient,
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
  TRPCClient,
} from '@trpc/client';

import SuperJSON from 'superjson';

import type { IoRouter } from './io-router.ts';
export class IoClient implements Io {
  private _clientRouter!: TRPCClient<IoRouter>;
  constructor(public readonly port: number) {}

  private _ioTools!: IoTools;
  private _isReady = new IsReady();

  isReady(): Promise<void> {
    return this._isReady.promise;
  }

  async init(): Promise<void> {
    await this._init();
  }

  async close(): Promise<void> {}

  tableExists(tableKey: TableKey): Promise<boolean> {
    return this._clientRouter.tableExists.query(tableKey);
  }
  dump(): Promise<Rljson> {
    return this._clientRouter.dump.query();
  }

  dumpTable(request: { table: string }): Promise<Rljson> {
    return this._clientRouter.dumpTable.query(request.table);
  }

  async createOrExtendTable(request: { tableCfg: TableCfg }): Promise<void> {
    const tableCfg = request.tableCfg as TableCfg;
    await this._clientRouter.createOrExtendTable.mutate(tableCfg);
  }
  tableCfgs(): Promise<Rljson> {
    return this._clientRouter.tableCfgs.query();
  }

  allTableKeys(): Promise<string[]> {
    return this._ioTools.allTableKeys();
  }

  rowCount(table: string): Promise<number> {
    return this._clientRouter.rowCount.query(table);
  }

  write(request: { data: Rljson }): Promise<void> {
    return this._clientRouter.write.mutate(request.data);
  }
  readRows(request: {
    table: string;
    where: { [column: string]: JsonValue };
  }): Promise<Rljson> {
    return this._clientRouter.readRows.query(request);
  }

  _initTrpcClient() {
    // Initialize the tRPC client
    this._clientRouter = createTRPCClient<IoRouter>({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: `http://localhost:${this.port}/trpc`,
            transformer: SuperJSON,
          }),
          false: httpBatchStreamLink({
            url: `http://localhost:${this.port}/trpc`,
            transformer: SuperJSON,
          }),
        }),
      ],
    });
  }

  private async _init() {
    this._initTrpcClient();
    // Create tableCfgs table
    this._ioTools = new IoTools(this);
    this._clientRouter.initTableCfgs.query();
    await this._ioTools.initRevisionsTable();
    this._isReady.resolve();
  }
}
