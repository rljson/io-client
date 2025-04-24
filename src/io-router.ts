// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Io } from '@rljson/io';
// import { Json } from '@rljson/json';
import { Rljson } from '@rljson/rljson';
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
  //***** */

  greeting: publicProcedure.query(() => {
    return 'hello tRPC v10!';
  }),
  sayHi: t.procedure.query(() => {
    return 'Hello there!';
  }),

  byId: publicProcedure.input(Number).query(async (opts) => {
    const { input } = opts;
    const user: { id: Number; name: string } = { id: input, name: 'user name' };
    return user;
  }),

  iterable: publicProcedure.query(async function* () {
    yield 'First update';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'Second update';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'Third update';
  }),
});

export type IoRouter = typeof ioRouter;
