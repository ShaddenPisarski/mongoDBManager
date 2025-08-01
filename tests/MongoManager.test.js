import { describe, it, expect, vi } from 'vitest';
import MongoManager from '../core/MongoDB';

describe('MongoManager', () => {
  it('uses provided connectionUri when specified', () => {
    const uri = 'mongodb://foo';
    const m = new MongoManager({ connectionUri: uri });
    expect(m.connectionUri).toBe(uri);
  });

  it('builds URI correctly from options', () => {
    const m = new MongoManager({
      username: 'u',
      password: 'p',
      host: 'h:27017',
      loginDatabase: 'db'
    });
    expect(m.connectionUri).toBe('mongodb://u:p@h:27017/db');
  });

  it('masks credentials in debugLogConnectionString', () => {
    const m = new MongoManager({ connectionUri: 'mongodb://u:p@h' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    m.debugLogConnectionString();
    expect(logSpy).toHaveBeenCalledWith(
      'Current used connection string:',
      'mongodb://***@h'
    );
    logSpy.mockRestore();
  });

  it('converts string to ObjectId', () => {
    const m = new MongoManager({ connectionUri: 'mongodb://foo' });
    const id = '507f1f77bcf86cd799439011';
    const objId = m.makeStringToObjectId(id);
    expect(objId.toString()).toBe(id);
  });

  it('closeConnection calls client.close', async () => {
    const m = new MongoManager({ connectionUri: 'mongodb://foo' });
    const closeSpy = vi.spyOn(m._client, 'close').mockResolvedValue();
    await m.closeConnection();
    expect(closeSpy).toHaveBeenCalled();
    closeSpy.mockRestore();
  });

  it('connect calls client.connect', async () => {
    const m = new MongoManager({ connectionUri: 'mongodb://foo' });
    const connectSpy = vi.spyOn(m._client, 'connect').mockResolvedValue();
    await m.connect();
    expect(connectSpy).toHaveBeenCalled();
    connectSpy.mockRestore();
  });

  it('validateInputWithSchemata stub exists', () => {
    const m = new MongoManager({ connectionUri: 'mongodb://foo' });
    expect(typeof m.validateInputWithSchemata).toBe('function');
    expect(m.validateInputWithSchemata()).toBeUndefined();
  });

  it('sets and gets database and collection', () => {
    const m = new MongoManager({ connectionUri: 'mongodb://foo' });
    // stub db and collection
    const fakeDb = {};
    const fakeCol = {};
    m._client.db = vi.fn().mockReturnValue(fakeDb);
    m.database = 'myDb';
    expect(m.database).toBe(fakeDb);

    m._database = fakeDb;
    fakeDb.collection = vi.fn().mockReturnValue(fakeCol);
    m.collection = 'myCol';
    expect(m.collection).toBe(fakeCol);
  });

  it('updateConnectionString closes and reconnects', async () => {
    const m = new MongoManager({ connectionUri: 'mongodb://foo' });
    const closeSpy = vi.spyOn(m._client, 'close').mockResolvedValue();
    const connectSpy = vi.spyOn(m, 'connect').mockResolvedValue();
    await m.updateConnectionString({ directConnection: true });
    expect(closeSpy).toHaveBeenCalled();
    expect(m._client.options.directConnection).toBe(true);
    expect(connectSpy).toHaveBeenCalled();
    closeSpy.mockRestore();
    connectSpy.mockRestore();
  });

  it('ESM default import works', () => {
    // full namespace import should have default equal to default import
    const full = require('../core/MongoDB');
    const { default: dflt } = full;
    expect(dflt).toBe(full);
  });
});
