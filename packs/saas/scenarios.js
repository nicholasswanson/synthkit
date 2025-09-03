export const scenarios = {
  default: {
    id: 'default',
    name: 'Default SaaS Scenario',
    description: 'Basic SaaS setup with users and teams',
    setup: async () => {
      console.log('SaaS default scenario activated');
      // Set up authentication flows, team management, etc.
    },
    teardown: async () => {
      console.log('SaaS default scenario deactivated');
    },
  },

  trial: {
    id: 'trial',
    name: 'Trial Experience',
    description: 'Scenario for trial users with limited features',
    setup: async () => {
      console.log('Trial scenario activated - limiting features');
      // Configure trial limitations, banners, upgrade prompts
    },
    teardown: async () => {
      console.log('Trial scenario deactivated');
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Customer',
    description: 'Scenario for enterprise customers with all features',
    setup: async () => {
      console.log('Enterprise scenario activated - all features enabled');
      // Enable SSO, advanced permissions, audit logs, etc.
    },
    teardown: async () => {
      console.log('Enterprise scenario deactivated');
    },
  },
};
