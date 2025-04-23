// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.
import { createTRPCClient, httpBatchLink } from '@trpc/client';

import { AppRouter } from '../server/api.ts';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

async function main() {
  // Call a procedure on the server. The type of `user` is inferred from the server.
  const result = await client.sayHi.query();
  console.log(result); // { id: '1', name: 'Bilbo' }
}

main();
