const {
    MongoClient,
    ObjectId
} = require('mongodb');

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
        }
        else {
            // build URI via shared helper and apply remaining client options
            this.connectionUri = MongoManager.buildConnectionUri({
                username,
                password,
                host,
                loginDatabase,
                authSource,
                srv,
                tlsOptions
            });
            this._client = new MongoClient(this.connectionUri, {
                authMechanism,
                ...clientOptions
            });
        }
    }

    async connect() {
        try {
            await this._client.connect();
        }
        catch (error) {
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
        }
        catch (error) {
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

    /**
     * Build a MongoDB connection URI from options (username, host, TLS, etc.).
     * @param {object} opts - Options matching constructor params (without clientOptions).
     * @returns {string} Generated MongoDB URI.
     */
    static buildConnectionUri(opts = {}) {
        const {
            connectionUri,
            username,
            password,
            host,
            loginDatabase,
            authSource,
            srv = false,
            tlsOptions = {}
        } = opts;
        if (connectionUri) return connectionUri;
        const protocol = srv ? 'mongodb+srv://' : 'mongodb://';
        let authPart = '';
        if (username) {
            authPart = encodeURIComponent(username);
            if (password) authPart += `:${encodeURIComponent(password)}`;
            authPart += '@';
        }
        const dbPath = loginDatabase ? `/${loginDatabase}` : '';
        let uri = `${protocol}${authPart}${host || ''}${dbPath}`;
        const params = [];
        if (authSource) params.push(`authSource=${encodeURIComponent(authSource)}`);
        if (Object.keys(tlsOptions).length) params.push(`tls=true`);
        if (tlsOptions.tlsAllowInvalidHostnames) params.push(`tlsAllowInvalidHostnames=true`);
        if (tlsOptions.tlsAllowInvalidCertificates) params.push(`tlsAllowInvalidCertificates=true`);
        if (tlsOptions.tlsCAFile) params.push(`tlsCAFile=${encodeURIComponent(tlsOptions.tlsCAFile)}`);
        if (tlsOptions.tlsCertificateKeyFile) params.push(`tlsCertificateKeyFile=${encodeURIComponent(tlsOptions.tlsCertificateKeyFile)}`);
        if (tlsOptions.tlsKeyFile) params.push(`tlsKeyFile=${encodeURIComponent(tlsOptions.tlsKeyFile)}`);
        if (tlsOptions.replicaSet) params.push(`replicaSet=${encodeURIComponent(tlsOptions.replicaSet)}`);
        if (params.length) uri += `?${params.join('&')}`;
        return uri;
    }

    /**
     * Save a connection URI into an env file for later use.
     * @param {string} uri - The URI string to save.
     * @param {string} [filePath='.env'] - Destination env file path.
     * @param {string} [envVar='MONGODB_CLUSTER_URI'] - Environment variable name.
     */
    static saveUriToEnvFile(uri, filePath = '.env', envVar = 'MONGODB_CLUSTER_URI') {
        const fs = require('fs');
        const line = `${envVar}="${uri}"\n`;
        fs.writeFileSync(filePath, line, {encoding: 'utf8'});
    }

    getConnectionURI() {
        return this.connectionUri;
    }

    makeStringToObjectId(string) {
        return new ObjectId(string);
    }
}

module.exports = MongoManager;
module.exports.default = MongoManager;
