import { createPack } from '@synthkit/sdk';
import { generators } from './generators.js';
import { scenarios } from './scenarios.js';

export default createPack({
  id: 'ecomm',
  name: 'E-commerce Pack',
  description: 'Generators for e-commerce applications - products, orders, inventory',
  version: '0.1.0',
  generators,
  scenarios,
});
