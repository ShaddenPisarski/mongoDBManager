/**
 * Initialize connection for given database
 * Param
 * @returns {Promise<MongoManager>}
 */
module.exports = async function mongoConnect(database = 'cluster') {
    const MongoWrapper = require('./MongoDB');
    const CONSTANTS = require('../constants');

    const DATABASE_OPTIONS = CONSTANTS.DATABASE;
    const dbInstance = new MongoWrapper(DATABASE_OPTIONS[database]);
    await dbInstance.connect();
    return dbInstance;
};