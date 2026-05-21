require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src/lib/prisma');

async function main() {
  console.log('Seeding demo users...');
  
  // We will hash individual passwords below since they are unique per user
  
  const usersToCreate = [
    { email: 'superadmin@vaultexp.com', name: 'Super Admin', role: 'SUPER_ADMIN', clearanceLevel: 4, password: 'SuperAdmin@123' },
    { email: 'admin@vaultexp.com', name: 'Platform Admin', role: 'ADMIN', clearanceLevel: 3, password: 'Admin@123' },
    { email: 'client@vaultexp.com', name: 'Demo Client', role: 'CLIENT', clearanceLevel: 2, password: 'Client@123' },
    { email: 'user@vaultexp.com', name: 'Demo User', role: 'USER', clearanceLevel: 1, password: 'User@123' },
  ];

  for (const u of usersToCreate) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
          status: 'active',
          isVerified: true,
          isApproved: true,
          isActive: true,
          clearanceLevel: u.clearanceLevel
        }
      });
      console.log(`Created ${u.role}: ${u.email}`);
    } else {
      await prisma.user.update({
        where: { email: u.email },
        data: {
          role: u.role,
          passwordHash, // Reset to standard password
          status: 'active',
          isApproved: true,
          isActive: true,
          clearanceLevel: u.clearanceLevel,
          loginAttempts: 0,
          lockedUntil: null
        }
      });
      console.log(`Updated ${u.role}: ${u.email}`);
    }
  }
  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
