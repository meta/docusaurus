/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {logger} from '@docusaurus/logger';

export async function listenToServer({
  server,
  port,
  host,
}: {
  server: import('node:http').Server;
  port: number;
  host: string;
}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    server.once('listening', () => resolve());
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(
          new Error(
            logger.interpolate`Address in use, another server is already listening on the requested port number=${port} and host name=${host}`,
            {cause: err},
          ),
        );
      } else {
        reject(err);
      }
    });
    server.listen(port, host);
  });
}
