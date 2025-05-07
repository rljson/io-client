// @license
// Copyright (c) 2025 Rljson
//
import { Io } from '@rljson/io';
import { JsonValue } from '@rljson/json';
import { Rljson, TableCfg } from '@rljson/rljson';
import { initTRPC } from '@trpc/server';

import SuperJSON from 'superjson';
import { z } from 'zod';


export interface IoContext {
  io: Io;
}

const t = initTRPC.context<IoContext>().create({ transformer: SuperJSON });

export const router = t.router;
export const publicProcedure = t.procedure;
export const ioRouter = router({
  //***** */
  dump: publicProcedure.query(async (opts) => {
    const result: Rljson = await opts.ctx.io.dump();
    return result;
  }),

  dumpTable: publicProcedure.input(String).query(async (opts) => {
    const { input } = opts;
    const result: Rljson = await opts.ctx.io.dumpTable({ table: input });
    return result;
  }),

  createOrExtendTable: publicProcedure
    .input(z.unknown())
    .mutation(async (opts) => {
      await createOrExtendTable(opts);
    }),

  tableCfgs: publicProcedure.query(async (opts) => {
    const result: Rljson = await opts.ctx.io.tableCfgs();
    return result;
  }),

  // error: don't know
  // allTableKeys: publicProcedure.query(async (opts) => {
  //   const result: string[] = await opts.ctx.io.allTableKeys();
  //   return result;
  // }),

  write: publicProcedure.input(z.unknown()).mutation(async (opts) => {
    const { input } = opts;
    const data = input as unknown as Rljson;

    await opts.ctx.io.write({ data: data });
    return void 0;
  }),
  // mangle input to { table: string; where: Record<string, unknown> }
  readRows: publicProcedure.input(z.unknown()).query(async (opts) => {
    const { input } = opts;
    const data = input as {
      table: string;
      where: { [column: string]: JsonValue };
    };
    const result: Rljson = await opts.ctx.io.readRows(data);
    return result;
  }),

  initTableCfgs: publicProcedure.query(async (opts) => {
    const result: Rljson = await opts.ctx.io.tableCfgs();
    return result;
  }),
  rowCount: publicProcedure.input(String).query(async (opts) => {
    const { input } = opts;
    const result: number = await opts.ctx.io.rowCount(input);
    return result;
  }),
  tableExists: publicProcedure.input(String).query(async (opts) => {
    const { input } = opts;
    const result: boolean = await opts.ctx.io.tableExists(input);
    return result;
  }),
});

//***** */

export type IoRouter = typeof ioRouter;

async function createOrExtendTable(opts: any) {
  const { input } = opts;
  const tableCfg = input as unknown as TableCfg;

  await opts.ctx.io.createOrExtendTable({ tableCfg: tableCfg });
}
