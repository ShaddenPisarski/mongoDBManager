/**
 * Database connection presets. Provide full connection URIs via environment variables.
 * Example:
 *   export MONGODB_CLUSTER_URI="mongodb://user:pass@host1,host2/db"
 *   export MONGODB_STANDALONE_URI="mongodb://user:pass@host/db"
 */
const CONSTANTS = {
  DATABASE: {
    cluster: {
      connectionUri: process.env.MONGODB_CLUSTER_URI,
      clientOptions: {
        readPreference: process.env.MONGODB_READ_PREFERENCE || 'primaryPreferred'
      }
    },
    standalone: {
      connectionUri: process.env.MONGODB_STANDALONE_URI,
      clientOptions: {
        readPreference: process.env.MONGODB_READ_PREFERENCE || 'primaryPreferred',
        directConnection: true
      }
    }
  }
};

module.exports = CONSTANTS;
