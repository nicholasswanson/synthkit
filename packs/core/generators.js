import { createGenerator } from '@synthkit/sdk';
import { faker } from '@faker-js/faker';

export const generators = {
  person: createGenerator({
    name: 'Person',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        bio: faker.person.bio(),
        birthDate: faker.date.birthdate(),
        phone: faker.phone.number(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  company: createGenerator({
    name: 'Company',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        industry: faker.helpers.arrayElement([
          'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
          'Education', 'Real Estate', 'Transportation', 'Entertainment'
        ]),
        employees: faker.number.int({ min: 10, max: 10000 }),
        founded: faker.date.past({ years: 50 }),
        website: faker.internet.url(),
        logo: faker.image.url(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  address: createGenerator({
    name: 'Address',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  post: createGenerator({
    name: 'Blog Post',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        title: faker.lorem.sentence(),
        slug: faker.lorem.slug(),
        content: faker.lorem.paragraphs(5),
        excerpt: faker.lorem.paragraph(),
        author: faker.person.fullName(),
        publishedAt: faker.date.recent(),
        tags: faker.helpers.arrayElements(
          ['tech', 'business', 'design', 'marketing', 'development', 'news'],
          { min: 1, max: 3 }
        ),
        imageUrl: faker.image.url(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  comment: createGenerator({
    name: 'Comment',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        postId: faker.string.uuid(),
        author: faker.person.fullName(),
        content: faker.lorem.paragraph(),
        createdAt: faker.date.recent(),
        likes: faker.number.int({ min: 0, max: 100 }),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),
};
