import { createGenerator } from '@synthkit/sdk';
import { faker } from '@faker-js/faker';

export const generators = {
  user: createGenerator({
    name: 'SaaS User',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        avatar: faker.image.avatar(),
        role: faker.helpers.arrayElement(['admin', 'user', 'viewer']),
        status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
        emailVerified: faker.datatype.boolean(),
        twoFactorEnabled: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        lastLoginAt: faker.date.recent(),
        preferences: {
          theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
          language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
          timezone: faker.location.timeZone(),
          notifications: {
            email: faker.datatype.boolean(),
            push: faker.datatype.boolean(),
            sms: faker.datatype.boolean(),
          },
        },
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  team: createGenerator({
    name: 'Team',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        name: faker.company.name(),
        slug: faker.lorem.slug(),
        description: faker.company.catchPhrase(),
        logo: faker.image.url(),
        plan: faker.helpers.arrayElement(['free', 'starter', 'pro', 'enterprise']),
        ownerId: faker.string.uuid(),
        memberCount: faker.number.int({ min: 1, max: 50 }),
        createdAt: faker.date.past(),
        settings: {
          allowInvites: faker.datatype.boolean(),
          requireApproval: faker.datatype.boolean(),
          defaultRole: faker.helpers.arrayElement(['member', 'viewer']),
        },
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  subscription: createGenerator({
    name: 'Subscription',
    generate: (options) => {
      const plan = faker.helpers.arrayElement(['free', 'starter', 'pro', 'enterprise']);
      const data = {
        id: faker.string.uuid(),
        teamId: faker.string.uuid(),
        plan,
        status: faker.helpers.arrayElement(['active', 'cancelled', 'past_due', 'trialing']),
        currentPeriodStart: faker.date.recent({ days: 30 }),
        currentPeriodEnd: faker.date.future({ years: 1 }),
        cancelAtPeriodEnd: faker.datatype.boolean(),
        trialEnd: plan === 'free' ? null : faker.date.future({ years: 0.1 }),
        seats: faker.number.int({ min: 1, max: 100 }),
        pricePerSeat: plan === 'free' ? 0 : faker.number.int({ min: 10, max: 100 }),
        currency: 'USD',
        billingInterval: faker.helpers.arrayElement(['monthly', 'yearly']),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  invoice: createGenerator({
    name: 'Invoice',
    generate: (options) => {
      const amount = faker.number.int({ min: 100, max: 10000 });
      const data = {
        id: faker.string.uuid(),
        subscriptionId: faker.string.uuid(),
        teamId: faker.string.uuid(),
        number: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
        status: faker.helpers.arrayElement(['paid', 'pending', 'overdue', 'void']),
        amount,
        tax: Math.round(amount * 0.1),
        total: Math.round(amount * 1.1),
        currency: 'USD',
        dueDate: faker.date.future({ years: 0.1 }),
        paidAt: faker.datatype.boolean() ? faker.date.recent() : null,
        items: [
          {
            description: 'Subscription',
            quantity: faker.number.int({ min: 1, max: 10 }),
            unitPrice: faker.number.int({ min: 10, max: 100 }),
            amount,
          },
        ],
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  apiKey: createGenerator({
    name: 'API Key',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        name: faker.hacker.noun() + ' API Key',
        key: `sk_${faker.string.alphanumeric(32)}`,
        prefix: faker.string.alphanumeric(8),
        teamId: faker.string.uuid(),
        createdBy: faker.string.uuid(),
        permissions: faker.helpers.arrayElements(
          ['read', 'write', 'delete', 'admin'],
          { min: 1, max: 4 }
        ),
        rateLimit: faker.number.int({ min: 100, max: 10000 }),
        expiresAt: faker.datatype.boolean() ? faker.date.future() : null,
        lastUsedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),
};
