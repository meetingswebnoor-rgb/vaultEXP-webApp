const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users`);
    await prisma.$disconnect();
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

checkDb();
