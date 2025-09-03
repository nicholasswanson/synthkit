import { createPack } from '@synthkit/sdk';
import { generators } from './generators.js';
import { scenarios } from './scenarios.js';

export default createPack({
  id: 'core',
  name: 'Core Pack',
  description: 'Basic generators for common data types',
  version: '0.1.0',
  generators,
  scenarios,
});
