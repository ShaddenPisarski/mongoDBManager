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
        catch (err) {
            err.message = `MongoManager.connect error: ${err.message}`;
            throw err;
        }
    }

    debugLogConnectionString() {
        const masked = this.connectionUri.replace(/:\/\/(.*?)@/, '://***@');
        console.log('Current used connection string:', masked);
    }

    get client() {
        return this._client;
    }

    get database() {
        return this._database;
    }

    set database(name) {
        this._database = this._client.db(name);
        return this;
    }

    get collection() {
        return this._collection;
    }

    set collection(name) {
        this._collection = this._database.collection(name);
        return this;
    }

    async updateConnectionString(newOptions = {}) {
        await this._client.close();
        this._client = new MongoClient(this.connectionUri, newOptions);
        await this.connect();
    }

    /**
     * Stub for input validation – to be implemented.
     * @param {*} input
     */
    validateInputWithSchemata(input) {
        // TODO: convert input according to schema definitions
    }

    async closeConnection() {
        await this._client.close();
    }

    makeStringToObjectId(str) {
        return new ObjectId(str);
    }

    /**
     * Build a MongoDB connection URI.
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

    getConnectionURI() {
        return this.connectionUri;
    }

    static saveUriToEnvFile(uri, path = '.env', envVar = 'MONGODB_CLUSTER_URI') {
        fs.writeFileSync(path, `${envVar}="${uri}"\n`, 'utf8');
    }
}
