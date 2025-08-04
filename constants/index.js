import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Import the CJS constants for backward compatibility
const __dirname = dirname(fileURLToPath(import.meta.url));
const { default: CONSTANTS } = await import(
  `file://${__dirname}/index.cjs`
);

export default CONSTANTS;
