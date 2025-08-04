import { describe, it, expect, vi } from 'vitest';
import MongoManager from '../core/MongoDB.js';
import fs from 'fs';

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


  it('buildConnectionUri returns provided connectionUri', () => {
    const custom = 'mongodb://custom';
    expect(MongoManager.buildConnectionUri({ connectionUri: custom })).toBe(custom);
  });

  it('buildConnectionUri generates full URI with authSource and tls options', () => {
    const uri = MongoManager.buildConnectionUri({
      username: 'u',
      password: 'p',
      host: 'h:1234',
      loginDatabase: 'db',
      authSource: 'admin',
      tlsOptions: {
        tlsCAFile: '/path/a',
        tlsCertificateKeyFile: '/path/b',
        tlsKeyFile: '/path/key',
        replicaSet: 'rs0'
      }
    });
    expect(uri).toBe(
      'mongodb://u:p@h:1234/db?authSource=admin&tls=true&tlsCAFile=%2Fpath%2Fa&tlsCertificateKeyFile=%2Fpath%2Fb&tlsKeyFile=%2Fpath%2Fkey&replicaSet=rs0'
    );
  });

  it('saveUriToEnvFile writes the URI correctly', () => {
    const tmp = '.tmp_env';
    MongoManager.saveUriToEnvFile('mongodb://test', tmp, 'TEST_URI');
    const content = fs.readFileSync(tmp, 'utf8');
    expect(content).toBe('TEST_URI="mongodb://test"\n');
    fs.unlinkSync(tmp);
  });
});

describe('Type validations', () => {
  it('constructor throws on non-object opts', () => {
    expect(() => new MongoManager(null)).toThrow(/Options must be an object/);
  });

  it('constructor rejects non-string connectionUri', () => {
    expect(() => new MongoManager({ connectionUri: 123 })).toThrow(/connectionUri must be a string/);
  });

  const inst = new MongoManager({ connectionUri: 'mongodb://x' });
  it('database setter rejects non-string', () => {
    expect(() => { inst.database = 42; }).toThrow(/Database name must be a string/);
  });

  it('collection setter rejects non-string', () => {
    inst._database = inst.client.db();
    expect(() => { inst.collection = {}; }).toThrow(/Collection name must be a string/);
  });

  it('makeStringToObjectId rejects non-string', () => {
    expect(() => inst.makeStringToObjectId(123)).toThrow(/ObjectId input must be a string/);
  });

  it('makeStringToObjectId rejects invalid hex', () => {
    expect(() => inst.makeStringToObjectId('zzzz')).toThrow(/Invalid ObjectId string/);
  });

  it('buildConnectionUri rejects non-object opts', () => {
    expect(() => MongoManager.buildConnectionUri(null)).toThrow(/Options must be an object/);
  });

  it('saveUriToEnvFile rejects non-string uri', () => {
    expect(() => MongoManager.saveUriToEnvFile(456)).toThrow(/URI must be a string/);
  });
});
