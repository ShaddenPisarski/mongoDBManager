# mongoDBManager
A wrapper class for MongoDB with utility functions for connecting, querying, and managing the client.

## Configuration

Configure your MongoDB connection via environment variables before using:

- `MONGODB_CLUSTER_URI` &ndash; Full MongoDB URI for cluster connections (e.g. `mongodb://user:pass@host1,host2/db`).
- `MONGODB_STANDALONE_URI` &ndash; Full MongoDB URI for standalone connections.
- `MONGODB_READ_PREFERENCE` &ndash; Optional readPreference setting (default: `primaryPreferred`).

## Example

```js
const mongoConnect = require('./core/mongoConnect');

(async () => {
  const db = await mongoConnect('cluster');
  // Access the native client:
  const client = db.client;
  // Switch databases/collections:
  db.database = 'myDatabase';
  db.collection = 'myCollection';

  // ... perform operations ...

  await db.closeConnection();
})();
```
