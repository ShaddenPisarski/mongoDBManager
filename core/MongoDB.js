const MongoNative = require('mongodb');
const MongoClient = MongoNative.MongoClient;
const ObjectId = MongoNative.ObjectId;
const MONGOWRAPPER_CONSTANTS = require('../constants/mongoDb');

/**
 * Wrapper class for mongo native
 * Documentations are found here:
 * https://docs.mongodb.com/drivers/node/quick-start/
 * http://mongodb.github.io/node-mongodb-native/3.6/api/
 *
 */
class MongoManager {
    /**
     * @param {Object} options
     * @param {String} [options.connectionUri] - The complete connection uri ready to use
     * @param {String} options.username - user that will be used.
     * @param {String} options.password - password that will be used.
     * @param {String} options.host - host that will be used, name with port: i.e.: example.com:1234
     * @param {String} options.loginDatabase - loginDatabase is the database that will be used login the user.
     * @param {String} options.authMechanism - authMechanism that is wanted.
     * Accepted values are: DEFAULT, SCRAM-SHA-256, SCRAM-SHA-1, MONGODB-X509.
     * An empty string falls back to DEFAULT
     *
     * @param {Object} options.tls - tls options, only effective if X.509 is selected as authMechanism
     * @param {Boolean} options.tls.tls - Specifies whether to use TLS/SSL connections.
     * @param {Boolean} options.tls.tlsInsecure - Specifies whether to allow invalid certificates and mismatched hostnames.
     * When set to true, this is equivalent to setting tlsAllowInvalidCertificates and tlsAllowInvalidHostnames to true.
     *
     * @param {String} options.tls.tlsCAFile - Path to file that contains a single or bundle of trusted certificate authorities used in a TLS connection.
     * @param {String} options.tls.tlsCertificateKeyFile - Path to the client certificate file or the client private key file.
     * If both are required, the two must be concatenated into a single file.
     *
     * @param {String} options.tls.tlsCertificateKeyFilePassword - String or buffer that contains the password to decrypt the client private key.
     * @param {Boolean} options.tls.tlsAllowInvalidCertificates - Specifies whether the driver permits an invalid certificate to be used to connect.
     * @param {Boolean} options.tls.tlsAllowInvalidHostnames - Specifies whether the driver should permit a mismatch between the server hostname and TLS certificate hostname.
     *
     * * @param {Object} options.clientOptions - Specifies the options the client should use.
     * The keys are the option and the values are the settings for the option.
     * i.e.: {writeConcern: 'majority'} => &writeConcern=majority
     */
    constructor(options) {
        if (options.connectionUri && typeof options.connectionUri === 'string') {
            this.connectionUri = options.connectionUri;
        }
        else {
            const username = encodeURIComponent(options.username);
            const password = options.password || false;
            const host = options.host;
            const loginDatabase = options.loginDatabase;
            const authSource = options.authSource;
            let clientOptions = '';

            if (options.svrString) {
                this.connectionUri = MONGOWRAPPER_CONSTANTS.STRINGS.MONGOSERVER_SVR + username;
            }
            else {
                this.connectionUri = MONGOWRAPPER_CONSTANTS.STRINGS.MONGOSERVER + username;
            }

            if (password) {
                this.connectionUri += MONGOWRAPPER_CONSTANTS.STRINGS.COLON + encodeURIComponent(password);
            }

            if (loginDatabase && loginDatabase !== '') {
                this.connectionUri +=
                    MONGOWRAPPER_CONSTANTS.STRINGS.AT
                    + host
                    + MONGOWRAPPER_CONSTANTS.STRINGS.SLASH
                    + loginDatabase;
            }
            else if (authSource && authSource !== '') {
                this.connectionUri +=
                    MONGOWRAPPER_CONSTANTS.STRINGS.AT
                    + host
                    + MONGOWRAPPER_CONSTANTS.STRINGS.CLIENT_PARAMETERS.BEGINING_STRING
                    + MONGOWRAPPER_CONSTANTS.STRINGS.CLIENT_PARAMETERS.AUTH_SOURCE
                    + MONGOWRAPPER_CONSTANTS.STRINGS.EQUAL_SIGN
                    + authSource;
            }

            /**
             * Read more about TLS connection here:
             * https://docs.mongodb.com/drivers/node/fundamentals/authentication/mechanisms/#x.509
             */
            if (options.tlsOptions) {
                for (let tlsOptionKey of Object.keys(options.tlsOptions)) {

                    // Encode paths to the key files
                    if (typeof options.tlsOptions[tlsOptionKey] === 'string') {
                        clientOptions += MONGOWRAPPER_CONSTANTS.STRINGS.AND
                            + tlsOptionKey
                            + MONGOWRAPPER_CONSTANTS.STRINGS.EQUAL_SIGN
                            + encodeURIComponent(options.tlsOptions[tlsOptionKey]);
                    }
                    else {
                        clientOptions += MONGOWRAPPER_CONSTANTS.STRINGS.AND
                            + tlsOptionKey
                            + MONGOWRAPPER_CONSTANTS.STRINGS.EQUAL_SIGN
                            + options.tlsOptions[tlsOptionKey];
                    }
                }
            }

            if (options.authMechanism) {
                let authMechanism = MONGOWRAPPER_CONSTANTS.STRINGS.AND
                    + MONGOWRAPPER_CONSTANTS.STRINGS.CLIENT_PARAMETERS.AUTH_MECHANISM
                    + MONGOWRAPPER_CONSTANTS.STRINGS.EQUAL_SIGN;

                this.connectionUri += authMechanism + encodeURIComponent(options.authMechanism);

                if (options.authMechanism === MONGOWRAPPER_CONSTANTS.AUTH_METHODS.DEFAULT
                    || options.authMechanism === MONGOWRAPPER_CONSTANTS.AUTH_METHODS.SCRAM_256
                    || options.authMechanism === MONGOWRAPPER_CONSTANTS.AUTH_METHODS.SCRAM_1
                    || options.authMechanism === MONGOWRAPPER_CONSTANTS.AUTH_METHODS.TLS
                ) {
                    this.connectionUri += authMechanism + options.authMechanism;
                }
                else {
                    this.connectionUri += authMechanism + MONGOWRAPPER_CONSTANTS.AUTH_METHODS.DEFAULT;
                }
            }

            // Add options for the client
            // i.e.: &readPreference=primaryPreferred
            if (options.clientOptions) {
                for (let clientOptionKey of Object.keys(options.clientOptions)) {
                    clientOptions += MONGOWRAPPER_CONSTANTS.STRINGS.AND
                        + clientOptionKey
                        + MONGOWRAPPER_CONSTANTS.STRINGS.EQUAL_SIGN
                        + options.clientOptions[clientOptionKey];
                }
            }


            this.connectionUri += clientOptions;
        }
        this._client = new MongoClient(this.connectionUri);
    }

    async connect() {
        try {
            await this._client.connect()
                .catch((error) => {
                    this.errorMessage(error);
                });
        }
        catch (error) {
            this.errorMessage(error);
        }
    }

    errorMessage(error) {
        throw new Error(error);
    }

    debugLogConnectionString() {
        console.log('Current used connection string:', this.connectionUri);
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
     * Add more parameters and update the connectionString.
     * Initiates a new MongoClass and closes the old one.
     * @param options
     */
    async updateConnectionString(options) {
        try {
            await this._client.close();

            this.connectionUri += options;
            this._client = new MongoClient(this.connectionUri);
            await this.connect()
                .catch((error) => {
                    this.errorMessage(error);
                });
        }
        catch (error) {
            this.errorMessage(error);
        }
    }

    validateInputWithSchemata(input) {
        // TODO Make function that converts input to data type given in schema
        // TODO This is for write operations
    }

    closeConnection() {
        this._client.close();
    }

    makeStringToObjectId(string) {
        return new ObjectId(string);
    }
}

module.exports = MongoManager;
