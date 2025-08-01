const { MongoClient, ObjectId } = require('mongodb');

/**
 * Wrapper class for mongo native
 * Documentations are found here:
 * https://docs.mongodb.com/drivers/node/quick-start/
 * http://mongodb.github.io/node-mongodb-native/3.6/api/
 *
 */
class MongoManager {
  /**
   * @param {object} opts
   * @param {string} [opts.connectionUri] - Full MongoDB connection string.
   * @param {string} [opts.username] - Username for auth (if no connectionUri).
   * @param {string} [opts.password] - Password for auth (if no connectionUri).
   * @param {string} [opts.host] - Host(s), e.g. "host1:27017,host2:27017" (if no connectionUri).
   * @param {string} [opts.loginDatabase] - Database for login (if no connectionUri).
   * @param {string} [opts.authSource] - authSource to use (if no connectionUri).
   * @param {boolean} [opts.srv=false] - Use mongodb+srv protocol (if no connectionUri).
   * @param {object} [opts.tlsOptions] - TLS options (if no connectionUri).
   * @param {string} [opts.authMechanism] - Authentication mechanism (if no connectionUri).
   * @param {object} [opts.clientOptions] - MongoClient options.
   */
  constructor(opts = {}) {
    const {
      connectionUri,
      username,
      password,
      host,
      loginDatabase,
      authSource,
      srv = false,
      tlsOptions = {},
      authMechanism,
      clientOptions = {}
    } = opts;

    if (connectionUri) {
      this.connectionUri = connectionUri;
      this._client = new MongoClient(this.connectionUri, clientOptions);
    } else {
      // build basic URI prefix and auth
      const protocol = srv ? 'mongodb+srv://' : 'mongodb://';
      let authPart = '';
      if (username) {
        authPart = encodeURIComponent(username);
        if (password) authPart += `:${encodeURIComponent(password)}`;
        authPart += '@';
      }
      const dbPath = loginDatabase ? `/${loginDatabase}` : '';
      this.connectionUri = `${protocol}${authPart}${host || ''}${dbPath}`;
      const options = {
        authSource,
        authMechanism,
        ...tlsOptions,
        ...clientOptions
      };
      this._client = new MongoClient(this.connectionUri, options);
    }
  }

  async connect() {
    try {
      await this._client.connect();
    } catch (error) {
      error.message = `MongoManager.connect error: ${error.message}`;
      throw error;
    }
  }

    errorMessage(error) {
        throw new Error(error);
    }

  debugLogConnectionString() {
    // mask credentials
    const masked = this.connectionUri.replace(/:\/\/(.*?)@/, '://***@');
    console.log('Current used connection string:', masked);
  }

    get client() {
        return this._client;
    }

    get collection() {
        return this._collection;
    }


    get database() {
        return this._database;
    }

    set database(databaseName) {
        try {
            this._database = this._client.db(databaseName);
            return this;
        }
        catch (error) {
            this.errorMessage(error);
        }
    }

    set collection(collectionName) {
        try {
            this._collection = this._database.collection(collectionName);
            return this;
        }
        catch (error) {
            this.errorMessage(error);
        }
    }

  /**
   * Close existing client and recreate with merged clientOptions.
   * @param {object} newClientOptions - Additional MongoClient options.
   * @returns {Promise<void>}
   */
  async updateConnectionString(newClientOptions = {}) {
    try {
      await this._client.close();
      this._client = new MongoClient(this.connectionUri, {
        ...newClientOptions
      });
      await this.connect();
    } catch (error) {
      error.message = `MongoManager.updateConnectionString error: ${error.message}`;
      throw error;
    }
  }

    validateInputWithSchemata(input) {
        // TODO Make function that converts input to data type given in schema
        // TODO This is for write operations
    }

  /**
   * Close the client connection.
   * @returns {Promise<void>}
   */
  async closeConnection() {
    await this._client.close();
  }

    makeStringToObjectId(string) {
        return new ObjectId(string);
    }
}

module.exports = MongoManager;
module.exports.default = MongoManager;
