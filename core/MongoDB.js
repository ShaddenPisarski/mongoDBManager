import {MongoClient, ObjectId} from 'mongodb';
import fs from 'fs';

/**
 * Wrapper class for MongoDB native driver.
 * Documentation: https://docs.mongodb.com/drivers/node/quick-start/
 */
export default class MongoManager {
    /**
     * @param {object} opts - Connection options.
     * @param {string} [opts.connectionUri]
     * @param {string} [opts.username]
     * @param {string} [opts.password]
     * @param {string} [opts.host]
     * @param {string} [opts.loginDatabase]
     * @param {string} [opts.authSource]
     * @param {boolean} [opts.srv=false]
     * @param {object} [opts.tlsOptions]
     * @param {string} [opts.authMechanism]
     * @param {object} [opts.clientOptions]
     */
    constructor(opts = {}) {
        if (typeof opts !== 'object' || opts === null) {
            throw new TypeError('Options must be an object');
        }
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

        if (connectionUri !== undefined && connectionUri !== null && typeof connectionUri !== 'string') {
            throw new TypeError('connectionUri must be a string');
        }
        if (connectionUri) {
            this.connectionUri = connectionUri;
            this._client = new MongoClient(this.connectionUri, clientOptions);
        }
        else {
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

    /**
     * Establishes a connection to MongoDB using the configured client.
     * @returns {Promise<void>}
     * @throws {Error} When the connection fails
     */
    async connect() {
        try {
            await this._client.connect();
        }
        catch (err) {
            err.message = `MongoManager.connect error: ${err.message}`;
            throw err;
        }
    }

    /**
     * Logs the current connection URI with credentials masked.
     * @returns {void}
     */
    debugLogConnectionString() {
        const masked = this.connectionUri.replace(/:\/\/(.*?)@/, '://***@');
        console.log('Current used connection string:', masked);
    }

    /**
     * Returns the underlying MongoClient instance.
     * @type {import('mongodb').MongoClient}
     */
    get client() {
        return this._client;
    }

    /**
     * Returns the active database instance.
     * @type {import('mongodb').Db}
     */
    get database() {
        return this._database;
    }

    /**
     * Sets the active database by name.
     * @param {string} name Database name
     * @returns {this}
     */
    set database(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Database name must be a string');
        }
        this._database = this._client.db(name);
        return this;
    }

    /**
     * Returns the active collection instance.
     * @type {import('mongodb').Collection}
     */
    get collection() {
        return this._collection;
    }

    /**
     * Sets the active collection by name.
     * @param {string} name Collection name
     * @returns {this}
     */
    set collection(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Collection name must be a string');
        }
        this._collection = this._database.collection(name);
        return this;
    }

    /**
     * Updates client options and reconnects the MongoClient.
     * @param {import('mongodb').MongoClientOptions} [newOptions] Additional client options
     * @returns {Promise<void>}
     */
    async updateConnectionString(newOptions = {}) {
        await this._client.close();
        this._client = new MongoClient(this.connectionUri, newOptions);
        await this.connect();
    }

    /**
     * Stub for input validation – to be implemented for write operations.
     * @param {*} input Arbitrary input to validate
     * @returns {void}
     */
    validateInputWithSchemata(input) {
        // TODO: convert input according to schema definitions
    }

    /**
     * Closes the current MongoClient connection.
     * @returns {Promise<void>}
     */
    async closeConnection() {
        await this._client.close();
    }

    /**
     * Converts a hexadecimal string to a MongoDB ObjectId.
     * @param {string} str Hexadecimal ObjectId string
     * @returns {import('mongodb').ObjectId}
     */
    makeStringToObjectId(str) {
        if (typeof str !== 'string') {
            throw new TypeError('ObjectId input must be a string');
        }
        if (!/^[0-9a-fA-F]{24}$/.test(str)) {
            throw new TypeError('Invalid ObjectId string');
        }
        return new ObjectId(str);
    }

    /**
     * Builds a MongoDB connection URI string from provided options.
     * @param {object} opts Options matching constructor params (excluding clientOptions)
     * @param {string} [opts.connectionUri]
     * @param {string} [opts.username]
     * @param {string} [opts.password]
     * @param {string} [opts.host]
     * @param {string} [opts.loginDatabase]
     * @param {string} [opts.authSource]
     * @param {boolean} [opts.srv=false]
     * @param {object} [opts.tlsOptions]
     * @returns {string} The constructed MongoDB URI
     */
    static buildConnectionUri(opts = {}) {
        if (typeof opts !== 'object' || opts === null) {
            throw new TypeError('Options must be an object');
        }
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
        if (Object.keys(tlsOptions).length) params.push('tls=true');
        if (tlsOptions.tlsAllowInvalidHostnames) params.push('tlsAllowInvalidHostnames=true');
        if (tlsOptions.tlsAllowInvalidCertificates) params.push('tlsAllowInvalidCertificates=true');
        if (tlsOptions.tlsCAFile) params.push(`tlsCAFile=${encodeURIComponent(tlsOptions.tlsCAFile)}`);
        if (tlsOptions.tlsCertificateKeyFile) params.push(`tlsCertificateKeyFile=${encodeURIComponent(tlsOptions.tlsCertificateKeyFile)}`);
        if (tlsOptions.tlsKeyFile) params.push(`tlsKeyFile=${encodeURIComponent(tlsOptions.tlsKeyFile)}`);
        if (tlsOptions.replicaSet) params.push(`replicaSet=${encodeURIComponent(tlsOptions.replicaSet)}`);
        if (params.length) uri += `?${params.join('&')}`;
        return uri;
    }

    /**
     * Returns the current connection URI string.
     * @returns {string}
     */
    getConnectionURI() {
        return this.connectionUri;
    }

    /**
     * Utility function for debugging purposes
     * Used to check the curren connected instance
     * @returns {Promise<unknown>}
     */
    async checkActiveHost() {
        const topology = this._client.topology;
        const servers = topology.description.servers;

        for (const [host, serverDesc] of servers.entries()) {
            if (serverDesc.type === 'RSPrimary' || serverDesc.type === 'RSSecondary' || serverDesc.type === 'Mongos') {
                return host;
            }
        }
    }

    /**
     * Saves the given URI into an env file under the specified variable name.
     * @param {string} uri Connection URI to save
     * @param {string} [path='.env'] Destination file path
     * @param {string} [envVar='MONGODB_CLUSTER_URI'] Environment variable key
     * @returns {void}
     */
    static saveUriToEnvFile(uri, path = '.env', envVar = 'MONGODB_CLUSTER_URI') {
        if (typeof uri !== 'string') {
            throw new TypeError('URI must be a string');
        }
        if (typeof path !== 'string') {
            throw new TypeError('File path must be a string');
        }
        if (typeof envVar !== 'string') {
            throw new TypeError('envVar must be a string');
        }
        fs.writeFileSync(path, `${envVar}="${uri}"\n`, 'utf8');
    }
}
