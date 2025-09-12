export const TEST_DESCRIPTIONS = {
  fitness: {
    description: 'A fitness app where users can track workouts, follow trainers, and join challenges',
    expectedType: 'fitness',
    expectedEntities: ['users', 'workouts', 'trainers', 'challenges']
  },
  ecommerce: {
    description: 'An online store selling handmade crafts with user reviews and ratings',
    expectedType: 'ecommerce',
    expectedEntities: ['products', 'users', 'reviews', 'orders']
  },
  saas: {
    description: 'A SaaS platform for team collaboration with document sharing and real-time chat',
    expectedType: 'saas',
    expectedEntities: ['users', 'teams', 'documents', 'messages']
  },
  marketplace: {
    description: 'A marketplace where freelancers can offer services and clients can hire them',
    expectedType: 'marketplace',
    expectedEntities: ['freelancers', 'clients', 'services', 'bookings']
  },
  social: {
    description: 'A social network for pet owners to share photos and connect with other pet lovers',
    expectedType: 'social',
    expectedEntities: ['users', 'pets', 'photos', 'connections']
  },
  education: {
    description: 'An online learning platform with courses, quizzes, and progress tracking',
    expectedType: 'education',
    expectedEntities: ['students', 'courses', 'lessons', 'quizzes']
  },
  fintech: {
    description: 'A digital wallet app for sending money, paying bills, and tracking expenses',
    expectedType: 'fintech',
    expectedEntities: ['users', 'transactions', 'bills', 'expenses']
  },
  invalid: {
    description: 'short',
    expectedError: 'at least 10 characters'
  }
};
