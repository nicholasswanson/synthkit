export const scenarios = {
  default: {
    id: 'default',
    name: 'Default Scenario',
    description: 'Basic scenario with sample data',
    setup: async () => {
      console.log('Core default scenario activated');
      // In a real scenario, you might set up mock handlers, initialize data, etc.
    },
    teardown: async () => {
      console.log('Core default scenario deactivated');
    },
  },

  blogsite: {
    id: 'blogsite',
    name: 'Blog Site',
    description: 'Scenario for a blog with posts and comments',
    setup: async () => {
      console.log('Blog site scenario activated');
      // This could set up MSW handlers for blog endpoints
    },
    teardown: async () => {
      console.log('Blog site scenario deactivated');
    },
  },
};
