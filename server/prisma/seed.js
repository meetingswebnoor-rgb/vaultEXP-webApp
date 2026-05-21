/**
 * VaultEXP — Production Seed Script
 * ============================================================
 * Creates all required seed users with bcrypt-hashed passwords.
 *
 * Usage:
 *   node prisma/seed.js
 *   npm run db:seed
 *
 * Safe to run multiple times — uses upsert (update OR create).
 *
 * ── Seed Users ────────────────────────────────────────────────
 * superadmin@vaultexp.com / SuperAdmin@123  → SUPER_ADMIN
 * admin@vaultexp.com      / Admin@123       → ADMIN
 * client@vaultexp.com     / Client@123      → CLIENT
 * user@vaultexp.com       / User@123        → USER
 * demo@vaultexp.com       / password123     → USER (demo)
 */

'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt           = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['error'],
});

const BCRYPT_ROUNDS = 12;

// ── Seed Users ─────────────────────────────────────────────────────────
const SEED_USERS = [
  {
    name:           'Super Administrator',
    email:          'superadmin@vaultexp.com',
    password:       'SuperAdmin@123',
    role:           'SUPER_ADMIN',
    isApproved:     true,
    isActive:       true,
    isVerified:     true,
    clearanceLevel: 5,
    status:         'active',
  },
  {
    name:           'Admin User',
    email:          'admin@vaultexp.com',
    password:       'Admin@123',
    role:           'ADMIN',
    isApproved:     true,
    isActive:       true,
    isVerified:     true,
    clearanceLevel: 3,
    status:         'active',
  },
  {
    name:           'Client User',
    email:          'client@vaultexp.com',
    password:       'Client@123',
    role:           'CLIENT',
    isApproved:     true,
    isActive:       true,
    isVerified:     true,
    clearanceLevel: 2,
    status:         'active',
  },
  {
    name:           'Regular User',
    email:          'user@vaultexp.com',
    password:       'User@123',
    role:           'USER',
    isApproved:     true,
    isActive:       true,
    isVerified:     true,
    clearanceLevel: 1,
    status:         'active',
  },
  {
    name:           'Demo User',
    email:          'demo@vaultexp.com',
    password:       'password123',
    role:           'USER',
    isApproved:     true,
    isActive:       true,
    isVerified:     true,
    clearanceLevel: 1,
    status:         'active',
  },
];

// ── Seed Function ──────────────────────────────────────────────────────
async function seed() {
  console.log('');
  console.log('🌱 VaultEXP — Seed Script Starting');
  console.log('═'.repeat(52));
  console.log('');

  // Verify DB connection first
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified');
    console.log('');
  } catch (err) {
    console.error('❌ Cannot connect to database:', err.message);
    console.error('   Check DATABASE_URL in your .env file');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let errors  = 0;

  for (const userData of SEED_USERS) {
    const { password, ...fields } = userData;

    try {
      // Hash password with bcrypt (12 rounds = production-grade)
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const result = await prisma.user.upsert({
        where:  { email: userData.email },
        update: {
          // Always reset password + status on re-seed
          passwordHash,
          name:           fields.name,
          role:           fields.role,
          isApproved:     fields.isApproved,
          isActive:       fields.isActive,
          isVerified:     fields.isVerified,
          clearanceLevel: fields.clearanceLevel,
          status:         fields.status,
          // Reset any lockouts
          loginAttempts:  0,
          lockedUntil:    null,
        },
        create: {
          ...fields,
          passwordHash,
          authProvider: 'local',
        },
        select: {
          id:        true,
          email:     true,
          role:      true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Detect create vs update (createdAt === updatedAt only on fresh create)
      const isNew = Math.abs(result.createdAt - result.updatedAt) < 1000;
      if (isNew) {
        created++;
        console.log(`  ✅  Created  [${result.role.padEnd(11)}]  ${result.email}`);
      } else {
        updated++;
        console.log(`  🔄  Updated  [${result.role.padEnd(11)}]  ${result.email}`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌  Failed   [${userData.role.padEnd(11)}]  ${userData.email}`);
      console.error(`               ${err.message}`);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────
  console.log('');
  console.log('═'.repeat(52));
  console.log(`📊  ${created} created  •  ${updated} updated  •  ${errors} errors`);
  console.log('');

  if (errors > 0) {
    console.error('⚠️   Some users failed. Check your DATABASE_URL and run:');
    console.error('     npx prisma migrate deploy');
    process.exit(1);
  }

  console.log('🔑  Login credentials:');
  console.log('');
  for (const u of SEED_USERS) {
    console.log(`     ${u.email.padEnd(36)} ${u.password}`);
  }
  console.log('');
  console.log('🎉  Seed complete! All users ready.');
  console.log('');
}

// ── Run ───────────────────────────────────────────────────────────────
seed()
  .catch((err) => {
    console.error('💥 Seed script crashed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
