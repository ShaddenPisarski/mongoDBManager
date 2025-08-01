const CONSTANTS = {
    DATABASE: {
        cluster: {
            username: 'NAME',
            password: 'PW',
            host: 'Host1:port,host2:port',
            authSource: 'dbName',
            tlsOptions: {
                tls: true,
                tlsAllowInvalidHostnames: true,
                tlsCAFile: '/path/to/file/mCA',
                tlsCertificateKeyFile: '/path/to/file/mPrCert_Key.pem'
            },
            clientOptions: {
                readPreference: 'primaryPreferred',
            }
        },
        standalone: {
            username: 'NAME',
            password: 'PW',
            host: 'host.de:27017',
            authSource: 'dbName',
            tlsOptions: {
                tls: true,
                tlsAllowInvalidHostnames: true,
                tlsCAFile: '/path/to/file/mCA',
                tlsCertificateKeyFile: '/path/to/file/mPrCert_Key.pem'
            },
            clientOptions: {
                readPreference: 'primaryPreferred',
                directConnection: true
            }
        }
    }
};

module.exports = CONSTANTS;
