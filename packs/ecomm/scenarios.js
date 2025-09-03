export const scenarios = {
  default: {
    id: 'default',
    name: 'Default E-commerce',
    description: 'Standard e-commerce setup with products and orders',
    setup: async () => {
      console.log('E-commerce default scenario activated');
      // Set up product catalog, shopping cart, checkout flow
    },
    teardown: async () => {
      console.log('E-commerce default scenario deactivated');
    },
  },

  blackfriday: {
    id: 'blackfriday',
    name: 'Black Friday Sale',
    description: 'High traffic scenario with sales and discounts',
    setup: async () => {
      console.log('Black Friday scenario activated - enabling sales features');
      // Enable sale prices, countdown timers, inventory warnings
    },
    teardown: async () => {
      console.log('Black Friday scenario deactivated');
    },
  },

  outofstock: {
    id: 'outofstock',
    name: 'Out of Stock',
    description: 'Scenario with many products out of stock',
    setup: async () => {
      console.log('Out of stock scenario activated');
      // Configure low inventory, waitlists, restock notifications
    },
    teardown: async () => {
      console.log('Out of stock scenario deactivated');
    },
  },

  international: {
    id: 'international',
    name: 'International Store',
    description: 'Multi-currency and multi-language scenario',
    setup: async () => {
      console.log('International scenario activated');
      // Enable currency conversion, language switching, international shipping
    },
    teardown: async () => {
      console.log('International scenario deactivated');
    },
  },
};
