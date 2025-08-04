# mongoDBManager
A wrapper class for MongoDB with utility functions for connecting, querying, and managing the client.

## Configuration

Configure your MongoDB connection via environment variables before using:

- `MONGODB_CLUSTER_URI` &ndash; Full MongoDB URI for cluster connections (e.g. `mongodb://user:pass@host1,host2/db`).
- `MONGODB_STANDALONE_URI` &ndash; Full MongoDB URI for standalone connections.
- `MONGODB_READ_PREFERENCE` &ndash; Optional readPreference setting (default: `primaryPreferred`).

## Example

```js
// ES module usage
import mongoConnect from './core/mongoConnect.js';

(async () => {
  const db = await mongoConnect('cluster');
  // Switch databases/collections:
  db.database = 'myDatabase';
  db.collection = 'myCollection';
  const collection = db.collection;

  // ... perform operations ...
  await collection.updateMany({ tes: true }, { $set: { yes: 1 } });

  await db.closeConnection();
})();

// For legacy CJS code you can use dynamic import:
// (async () => { const { default: mongoConnect } = await import('./core/mongoConnect.js'); })();
```

## Example: Encrypting Credentials

You can encrypt your `.env` credentials file and store it safely. An example usage is provided in the `examples/` directory with placeholder credentials.

### Setup

1. Navigate to the examples directory:

    ```bash
    cd examples
    ```

2. (Optional) Re-encrypt the sample environment file:

    ```bash
    ./encrypt-env.sh password_example
    ```

3. Decrypt the credentials and run the demo script:

    ```bash
    ./decrypt-and-run.sh password_example
    ```

This will decrypt `.env.enc` to `.env`, install `dotenv`, and run `index.js` which displays the loaded MongoDB configuration.

## Example: Generating and Saving a Connection URI

If you only know your server address and TLS file locations, you can generate a full URI and write it to an env file:

```js
// ES module usage
import fs from 'fs';
import MongoManager from './core/MongoDB.js';

// Build a connection URI from minimal parameters
const uri = MongoManager.buildConnectionUri({
  username: 'myUser',
  password: 'myPass',
  host: 'replica01-91:27017',
  loginDatabase: 'admin',
  authSource: 'admin',
  tlsOptions: {
    tlsCAFile: '/path/to/a/b/c',
    tlsCertificateKeyFile: '/path/to/e/d/f'
  }
});

// Save into a .env file for downstream usage
MongoManager.saveUriToEnvFile(uri, '.env', 'MONGODB_CLUSTER_URI');

console.log('Connection URI generated and saved to .env.');

// For legacy CJS code you can use dynamic import:
// (async () => { const fs = require('fs'); const { default: MongoManager } = await import('./core/MongoDB.js'); })();
```
