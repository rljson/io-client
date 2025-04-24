// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Io } from '@rljson/io';
import { JsonValue } from '@rljson/json';
import { Rljson, TableCfg } from '@rljson/rljson';
import { initTRPC } from '@trpc/server';

import SuperJSON from 'superjson';

export interface IoContext {
  io: Io;
}

const t = initTRPC.context<IoContext>().create({ transformer: SuperJSON });

export const router = t.router;
export const publicProcedure = t.procedure.use((opts) => {
  const { ctx } = opts;
  ctx.io;

  return opts.next();
});
export const ioRouter = router({
  //***** */
  ioDump: publicProcedure.query(async (opts) => {
    const result: Rljson = await opts.ctx.io.dump();
    return result;
  }),

  ioDumpTable: publicProcedure.input(String).query(async (opts) => {
    const { input } = opts;
    const result: Rljson = await opts.ctx.io.dumpTable({ table: input });
    return result;
  }),
  // Needs a tableCfg as input***************************************
  ioCreateTable: publicProcedure.input(String).mutation(async (opts) => {
    const { input } = opts;
    const tableCfg = input as unknown as TableCfg;
    await opts.ctx.io.createTable({ tableCfg: tableCfg });
    return void 0;
  }),

  ioTableCfgs: publicProcedure.query(async (opts) => {
    const result: Rljson = await opts.ctx.io.tableCfgs();
    return result;
  }),

  ioAllTableNames: publicProcedure.query(async (opts) => {
    const result: string[] = await opts.ctx.io.allTableNames();
    return result;
  }),

  ioWrite: publicProcedure.input(String).mutation(async (opts) => {
    const { input } = opts;
    const data = input as unknown as Rljson;
    await opts.ctx.io.write({ data: data });
    return void 0;
  }),
  // mangle input to { table: string; where: Record<string, unknown> }
  ioReadRows: publicProcedure.input(String).query(async (opts) => {
    const { input } = opts;
    console.log('input', input);
    const dummyVal = {
      table: 'x',
      where: {
        table: 'x',
        where: {
          column: 'string',
          value: 'z' as JsonValue,
        },
      },
    };

    const result: Rljson = await opts.ctx.io.readRows(dummyVal);
    return result;
  }),
});

//***** */

export type IoRouter = typeof ioRouter;
