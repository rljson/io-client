import { describe, expect, it } from 'vitest';

// Import or define the trpc object
import { IoClient } from '../src/io-client'; // Adjust the path as needed


// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
describe('ioRouter', () => {
  it('should return the greeting message', async () => {
    const client = new IoClient();
    const result = await client.greeting();
    expect(result).toBe('hello tRPC v10!');
  });
});
