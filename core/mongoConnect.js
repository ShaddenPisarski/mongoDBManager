import MongoWrapper from './MongoDB.js';
import CONSTANTS from '../constants/index.js';

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
  const MongoManager = (await import('./MongoDB.js')).default;
  const { default: CONSTANTS } = await import('../constants/index.js');
  const dbInstance = new MongoManager(CONSTANTS.DATABASE[database]);
  await dbInstance.connect();
  return dbInstance;
}
