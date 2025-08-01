# mongoDbManager

This is a wrapper for the MongoDB-Driver.
A utility class, where you just can use a JSON to connect to your database and make the rest of the code easier to read.
It hase some other utlity function in this class, to make the native MongoDB-Driver easier to use.

## Code Style

- AirBnb coding style
- Node.js state of the art.
- Use JSDoc docstrings for documenting functions
- Use descriptive variable/function names

## Configuration

Configure connection via environment variables:

- `MONGODB_CLUSTER_URI`: full URI for cluster connections
- `MONGODB_STANDALONE_URI`: full URI for standalone
- `MONGODB_READ_PREFERENCE`: optional readPreference

## Testing

- Create unit tests for each public method (constructor, connect, closeConnection, debugLogConnectionString, makeStringToObjectId)

## Architecture

- This class should be usable with CJS or ESM
