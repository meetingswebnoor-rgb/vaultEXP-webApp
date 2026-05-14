// MongoDB initialization script for Docker
db = db.getSiblingDB('vaultexp');

db.createCollection('users');
db.createCollection('vaults');

// Seed admin user (password: Admin@123456 — change in production!)
db.users.insertOne({
  firstName: 'Vault',
  lastName: 'Admin',
  email: 'admin@vaultexp.com',
  password: '$2a$12$XWfTJriQZcLQJ5XmhHrJZuHkFiSX4IG1KcABPP8RiHDk3vMEDkYIu', // Admin@123456
  role: 'admin',
  status: 'active',
  subscription: 'enterprise',
  isEmailVerified: true,
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: { email: true, push: true, sms: false },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

print('✅ MongoDB initialized with seed data');
