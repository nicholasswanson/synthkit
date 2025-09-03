import { createPack } from '@synthkit/sdk';
import { generators } from './generators.js';
import { scenarios } from './scenarios.js';

export default createPack({
  id: 'saas',
  name: 'SaaS Pack',
  description: 'Generators for SaaS applications - users, teams, subscriptions',
  version: '0.1.0',
  generators,
  scenarios,
});
