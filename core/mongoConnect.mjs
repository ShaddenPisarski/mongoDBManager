import MongoWrapper from './MongoDB.mjs';
import CONSTANTS from '../constants/index.mjs';

/**
 * Initialize and connect to the specified database preset.
 * @param {string} [database='cluster'] - Key of the preset in constants.DATABASE
 * @returns {Promise<MongoManager>}
 */
/**
 * Initialize and connect to the specified database preset.
 * @param {string} [database='cluster'] - Key in constants.DATABASE
 * @returns {Promise<MongoManager>}
 */
export default async function mongoConnect(database = 'cluster') {
  const dbInstance = new MongoWrapper(CONSTANTS.DATABASE[database]);
  await dbInstance.connect();
  return dbInstance;
}
