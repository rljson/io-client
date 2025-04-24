// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { initTRPC } from '@trpc/server';

const t = initTRPC.create();
export const router = t.router;
// why do we need this?
export const publicProcedure = t.procedure;

export const ioRouter = router({
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
