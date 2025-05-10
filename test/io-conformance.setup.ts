// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Io, IoMem, IoTestSetup } from '@rljson/io';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import cors from 'cors';
import express from 'express';
import getPort, { clearLockedPorts } from 'get-port';
import { Server } from 'http';

import { IoClient } from '../src/io-client';
import { ioRouter } from '../src/io-router';

// ..............................................................................
class IoClientTestSetup implements IoTestSetup {
  get io(): Io {
    if (!this._io) {
      throw new Error('Call init() before accessing io');
    }
    return this._io;
  }

  async init(): Promise<void> {
    await this._initPort();
    await this._initDb();
    await this._initServer();
    await this._initIoClient();
  }

  async tearDown(): Promise<void> {
    this._server.closeAllConnections();
    this._server.close();
  }

  // ######################
  // Private
  // ######################

  private _port: number;
  private _db: IoMem;
  private _io: Io | null = null;
  private _server: Server;

  // ...........................................................................
  _initPort = async () => {
    this._port = await getPort();
    clearLockedPorts();
  };

  // ...........................................................................
  _initDb = async () => {
    // Create server side database
    this._db = new IoMem();
    this._db.init();
  };

  // ...........................................................................
  _initServer = async () => {
    // Create an express app
    const app = express();
    app.use(cors({ origin: `http://localhost:${this._port}` }));
    app.use(
      '/trpc',
      createExpressMiddleware({
        router: ioRouter,
        createContext: () => {
          return {
            io: this._db,
          };
        },
      }),
    );
    this._server = app.listen(this._port);
  };

  // ...........................................................................
  _initIoClient = async () => {
    // Create client side database
    this._io = new IoClient(this._port);
  };
}

// .............................................................................
export { Io, IoTestSetup, IoTools } from '@rljson/io';

// .............................................................................
export const testSetup = () => new IoClientTestSetup();
