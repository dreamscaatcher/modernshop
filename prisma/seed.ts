import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Existing data cleared');

  // Create categories
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', description: 'Apparel and fashion items' },
    { name: 'Home & Kitchen', description: 'Household items and kitchen appliances' },
    { name: 'Books', description: 'Books, ebooks, and audiobooks' },
    { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log(`Created ${categories.length} categories`);

  // Fetch created categories for reference
  const createdCategories = await prisma.category.findMany();

  // Create products (20 per category)
  for (const category of createdCategories) {
    const productsPerCategory = 20;
    
    for (let i = 0; i < productsPerCategory; i++) {
      await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
          stock: faker.number.int({ min: 0, max: 100 }),
          images: [
            faker.image.url({ width: 640, height: 480 }),
            faker.image.url({ width: 640, height: 480 }),
          ],
          categoryId: category.id,
          highlighted: i < 3, // Highlight the first 3 products of each category
        },
      });
    }
  }

  const totalProducts = createdCategories.length * 20;
  console.log(`Created ${totalProducts} products`);

  // Create users (10 regular users, 1 admin)
  const users = [];

  // Admin user
  users.push({
    name: 'Admin User',
    email: 'admin@modernshop.com',
    password: '$2a$10$Qk2.hbHWMkpEQjSsVzY1iuO5UYwRHtI58Pq/VB7.62YnqLP86Ajqy', // "password123"
    role: 'ADMIN' as const,
  });

  // Regular users
  for (let i = 0; i < 10; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '$2a$10$Qk2.hbHWMkpEQjSsVzY1iuO5UYwRHtI58Pq/VB7.62YnqLP86Ajqy', // "password123"
      role: 'USER' as const,
    });
  }

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log(`Created ${users.length} users`);

  // Create addresses for each user
  const createdUsers = await prisma.user.findMany();
  for (const user of createdUsers) {
    const addressCount = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < addressCount; i++) {
      await prisma.address.create({
        data: {
          userId: user.id,
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
          isDefault: i === 0, // Make the first address the default
        },
      });
    }
  }

  console.log('Created addresses for all users');

  // Create carts for regular users (not admin)
  const regularUsers = createdUsers.filter(user => user.role === 'USER');
  for (const user of regularUsers) {
    // Create cart
    const cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    // Add random products to cart (1-5 items)
    const allProducts = await prisma.product.findMany();
    const itemCount = faker.number.int({ min: 1, max: 5 });
    const randomProducts = faker.helpers.arrayElements(allProducts, itemCount);

    for (const product of randomProducts) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 3 }),
        },
      });
    }
  }

  console.log('Created carts for regular users');

  // Create orders (1-3 per regular user)
  for (const user of regularUsers) {
    const orderCount = faker.number.int({ min: 1, max: 3 });
    const userAddresses = await prisma.address.findMany({
      where: { userId: user.id },
    });
    
    for (let i = 0; i < orderCount; i++) {
      // Get random products for this order
      const allProducts = await prisma.product.findMany();
      const itemCount = faker.number.int({ min: 1, max: 8 });
      const randomProducts = faker.helpers.arrayElements(allProducts, itemCount);
      
      // Calculate total price
      let totalPrice = 0;
      const orderItems = [];
      
      for (const product of randomProducts) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = product.price;
        totalPrice += price * quantity;
        
        orderItems.push({
          productId: product.id,
          quantity,
          price,
        });
      }
      
      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          shippingAddressId: faker.helpers.arrayElement(userAddresses).id,
          total: totalPrice,
          status: faker.helpers.arrayElement(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
        },
      });
      
      // Create order items
      for (const item of orderItems) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
    }
  }

  console.log('Created orders for regular users');
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });