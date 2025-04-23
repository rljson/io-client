import { initTRPC } from '@trpc/server';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import cors from 'cors';
import express from 'express';

const t = initTRPC.create();

const appRouter = t.router({
  // simple proceure returning a string
  sayHi: t.procedure.query(() => {
    return 'Hello there!';
  }),
  // procedure needing an input string
  logToServer: t.procedure
    .input((v) => {
      if (typeof v !== 'string') {
        throw new Error('Invalid input, expected a string');
      }
      return v;
    })
    .mutation((req) => {
      console.log('Received from client:', req.input);
      return 'Logged to server';
    }),
});

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/trpc', createExpressMiddleware({ router: appRouter }));
app.listen(3000);

export type AppRouter = typeof appRouter;
