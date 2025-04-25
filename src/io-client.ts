// @license
// Copyright (c) 2025 Rljson
//
import { Io } from '@rljson/io';
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
  private _client: ReturnType<typeof createTRPCClient<IoRouter>>;

  constructor() {
    // Initialize the tRPC client
    this._client = createTRPCClient<IoRouter>({
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
    throw new Error('Method not implemented.');
  }
  dump(): Promise<Rljson> {
    return this._client.ioDump.query();
  }
  dumpTable(request: { table: string }): Promise<Rljson> {
    return this._client.ioDumpTable.query(request.table);
  }

  async createTable(request: { tableCfg: TableCfg }): Promise<void> {
    const tableCfg = request.tableCfg as TableCfg;
    await this._client.ioCreateTable.mutate(tableCfg);
  }
  tableCfgs(): Promise<Rljson> {
    return this._client.ioTableCfgs.query();
  }
  allTableNames(): Promise<string[]> {
    return this._client.ioAllTableNames.query();
  }
  write(request: { data: Rljson }): Promise<void> {
    return this._client.ioWrite.mutate(request.data);
  }
  readRows(request: {
    table: string;
    where: { [column: string]: JsonValue };
  }): Promise<Rljson> {
    return this._client.ioReadRows.query(request);
  }

  public async ioDump(): Promise<Rljson> {
    try {
      // Call the ioDump query on the tRPC client
      const result = await this._client.ioDump.query();
      return result;
    } catch (error) {
      console.error('Error calling ioDump query:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  public async ioDumpTable(request: { table: string }): Promise<Rljson> {
    try {
      // Call the ioDump query on the tRPC client
      const result = await this._client.ioDumpTable.query(request.table);
      return result;
    } catch (error) {
      console.error('Error calling ioDumpTable query:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  public async ioCreateTable(request: { tableCfg: TableCfg }): Promise<void> {
    try {
      // avoid stringify here*******************************************
      await this._client.ioCreateTable.mutate(request.tableCfg);
    } catch (error) {
      console.error('Error calling createTable mutation:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  public async ioAllTableNames(): Promise<string[]> {
    try {
      // Call the ioDump query on the tRPC client
      const result = await this._client.ioAllTableNames.query();
      return result;
    } catch (error) {
      console.error('Error calling ioAllTableNames query:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }
  public async ioWrite(request: { data: Rljson }): Promise<void> {
    try {
      // Call the ioDump query on the tRPC client
      await this._client.ioWrite.mutate(request.data);
    } catch (error) {
      console.error('Error calling ioWrite mutation:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  public async ioTableCfgs(): Promise<Rljson> {
    try {
      // Call the ioDump query on the tRPC client
      const result = await this._client.ioTableCfgs.query();
      return result;
    } catch (error) {
      console.error('Error calling ioTableCfgs query:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }
}
