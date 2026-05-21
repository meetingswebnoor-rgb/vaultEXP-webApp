const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users 
      ADD COLUMN is_approved BOOLEAN DEFAULT false, 
      ADD COLUMN is_active BOOLEAN DEFAULT true, 
      ADD COLUMN approved_by_id VARCHAR(191), 
      ADD COLUMN approved_at DATETIME(3), 
      ADD COLUMN clearance_level INT DEFAULT 1;
    `);
    console.log('Added columns successfully!');
  } catch (e) {
    console.error('Migration error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
