import { createGenerator } from '@synthkit/sdk';
import { faker } from '@faker-js/faker';

export const generators = {
  product: createGenerator({
    name: 'Product',
    generate: (options) => {
      const price = faker.number.float({ min: 10, max: 1000, multipleOf: 0.01 });
      const data = {
        id: faker.string.uuid(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
        price,
        compareAtPrice: faker.datatype.boolean() ? price * 1.2 : null,
        currency: 'USD',
        images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
          url: faker.image.url(),
          alt: faker.lorem.words(3),
        })),
        inStock: faker.datatype.boolean(),
        inventory: faker.number.int({ min: 0, max: 100 }),
        variants: faker.helpers.arrayElements(
          ['Small', 'Medium', 'Large', 'XL'],
          { min: 1, max: 4 }
        ).map(size => ({
          id: faker.string.uuid(),
          size,
          color: faker.color.human(),
          price,
          inventory: faker.number.int({ min: 0, max: 50 }),
        })),
        rating: faker.number.float({ min: 3.5, max: 5, multipleOf: 0.1 }),
        reviewCount: faker.number.int({ min: 0, max: 1000 }),
        tags: faker.helpers.arrayElements(
          ['new', 'sale', 'featured', 'bestseller', 'limited'],
          { min: 0, max: 3 }
        ),
        createdAt: faker.date.past(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  order: createGenerator({
    name: 'Order',
    generate: (options) => {
      const items = Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => {
          const price = faker.number.float({ min: 10, max: 500, multipleOf: 0.01 });
          const quantity = faker.number.int({ min: 1, max: 3 });
          return {
            productId: faker.string.uuid(),
            productName: faker.commerce.productName(),
            price,
            quantity,
            total: price * quantity,
          };
        }
      );
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.08;
      const shipping = faker.number.float({ min: 0, max: 20, multipleOf: 0.01 });
      
      const data = {
        id: faker.string.uuid(),
        orderNumber: `ORD-${faker.number.int({ min: 10000, max: 99999 })}`,
        customerId: faker.string.uuid(),
        status: faker.helpers.arrayElement([
          'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
        ]),
        items,
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping,
        currency: 'USD',
        paymentMethod: faker.helpers.arrayElement([
          'credit_card', 'paypal', 'apple_pay', 'google_pay'
        ]),
        shippingAddress: {
          name: faker.person.fullName(),
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        billingAddress: {
          name: faker.person.fullName(),
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        tracking: faker.datatype.boolean() ? {
          carrier: faker.helpers.arrayElement(['USPS', 'UPS', 'FedEx', 'DHL']),
          number: faker.string.alphanumeric(12).toUpperCase(),
        } : null,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  customer: createGenerator({
    name: 'Customer',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        totalOrders: faker.number.int({ min: 0, max: 50 }),
        totalSpent: faker.number.float({ min: 0, max: 10000, multipleOf: 0.01 }),
        averageOrderValue: faker.number.float({ min: 50, max: 500, multipleOf: 0.01 }),
        tags: faker.helpers.arrayElements(
          ['vip', 'frequent', 'new', 'inactive', 'wholesale'],
          { min: 0, max: 2 }
        ),
        acceptsMarketing: faker.datatype.boolean(),
        defaultAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        createdAt: faker.date.past(),
        lastOrderAt: faker.date.recent(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  cart: createGenerator({
    name: 'Shopping Cart',
    generate: (options) => {
      const items = Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => {
          const price = faker.number.float({ min: 10, max: 500, multipleOf: 0.01 });
          const quantity = faker.number.int({ min: 1, max: 3 });
          return {
            productId: faker.string.uuid(),
            productName: faker.commerce.productName(),
            price,
            quantity,
            total: price * quantity,
            image: faker.image.url(),
          };
        }
      );
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      
      const data = {
        id: faker.string.uuid(),
        sessionId: faker.string.uuid(),
        customerId: faker.datatype.boolean() ? faker.string.uuid() : null,
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        estimatedTax: subtotal * 0.08,
        estimatedTotal: subtotal * 1.08,
        currency: 'USD',
        abandonedAt: faker.datatype.boolean() ? faker.date.recent() : null,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),

  review: createGenerator({
    name: 'Product Review',
    generate: (options) => {
      const data = {
        id: faker.string.uuid(),
        productId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        customerName: faker.person.fullName(),
        rating: faker.number.int({ min: 1, max: 5 }),
        title: faker.lorem.sentence(),
        comment: faker.lorem.paragraph(),
        verified: faker.datatype.boolean(),
        helpful: faker.number.int({ min: 0, max: 100 }),
        unhelpful: faker.number.int({ min: 0, max: 20 }),
        images: faker.datatype.boolean() 
          ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.image.url())
          : [],
        createdAt: faker.date.past(),
      };
      
      return options?.overrides ? { ...data, ...options.overrides } : data;
    },
  }),
};
