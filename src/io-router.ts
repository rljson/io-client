// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { initTRPC } from '@trpc/server';

// import { publicProcedure, router } from './trpc.js';

// You can use any variable name you like.
// We use t to keep things simple.
const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const ioRouter = router({
  greeting: publicProcedure.query(() => {
    return 'hello tRPC v10!';
  }),
  sayHi: t.procedure.query(() => {
    return 'Hello there!';
  }),

  byId: publicProcedure.input(String).query(async (opts) => {
    const { input } = opts;
    console.log('input', input);
    const user = 'fu';
    return user;
  }),
});
// Export only the type of a router!
// This prevents us from importing server code on the client.
export type IoRouter = typeof ioRouter;
