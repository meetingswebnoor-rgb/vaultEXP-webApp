const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // SUPER ADMIN
  await prisma.user.upsert({
    where: { email: 'superadmin@vaultexp.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@vaultexp.com',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'active',
      isApproved: true,
      isVerified: true,
      clearanceLevel: 10
    }
  });

  // ADMIN
  await prisma.user.upsert({
    where: { email: 'admin@vaultexp.com' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@vaultexp.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'active',
      isApproved: true,
      isVerified: true,
      clearanceLevel: 7
    }
  });

  // CLIENT
  await prisma.user.upsert({
    where: { email: 'client@vaultexp.com' },
    update: {},
    create: {
      name: 'Demo Client',
      email: 'client@vaultexp.com',
      passwordHash: hashedPassword,
      role: 'CLIENT',
      status: 'active',
      isApproved: true,
      isVerified: true,
      clearanceLevel: 3
    }
  });

  // USER
  await prisma.user.upsert({
    where: { email: 'demo@vaultexp.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@vaultexp.com',
      passwordHash: hashedPassword,
      role: 'USER',
      status: 'active',
      isApproved: true,
      isVerified: true,
      clearanceLevel: 1
    }
  });

  console.log('✅ Users seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });