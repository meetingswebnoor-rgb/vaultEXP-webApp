const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    console.log('✅ User table exists. Count:', userCount);
    const businessCount = await prisma.business.count();
    console.log('✅ Business table exists. Count:', businessCount);
    const propertyCount = await prisma.property.count();
    console.log('✅ Property table exists. Count:', propertyCount);
  } catch (e) {
    console.error('❌ Table check failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
