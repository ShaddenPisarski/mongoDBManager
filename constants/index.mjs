import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Database connection presets. Provide full connection URIs via environment variables.
 */
export default {
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
