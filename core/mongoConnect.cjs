/**
 * Initialize and connect to the specified database preset.
 * @param {string} [database='cluster'] - Key of the preset in constants.DATABASE
 * @returns {Promise<MongoManager>}
 */
module.exports = async function mongoConnect(database = 'cluster') {
  const MongoWrapper = require('./MongoDB.cjs');
  const CONSTANTS = require('../constants/index.cjs');

  const DATABASE_OPTIONS = CONSTANTS.DATABASE;
  const dbInstance = new MongoWrapper(DATABASE_OPTIONS[database]);
  await dbInstance.connect();
  return dbInstance;
};
