import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

interface SeedOptions {
  email: string;
  password: string;
  name: string;
  role: 'PARENT' | 'TEACHER' | 'DIRECTOR' | 'ADMIN';
}

async function seedAdminUser(options: SeedOptions) {
  const { email, password, name, role } = options;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    return existingUser;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  console.log(`Created ${role} user: ${email}`);
  return user;
}

async function main() {
  console.log('Starting seed...\n');

  // Get admin credentials from environment or use defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@puruni.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  // Seed admin user
  await seedAdminUser({
    email: adminEmail,
    password: adminPassword,
    name: adminName,
    role: 'ADMIN',
  });

  // Seed director user (optional)
  if (process.env.SEED_DIRECTOR === 'true') {
    await seedAdminUser({
      email: process.env.DIRECTOR_EMAIL || 'director@puruni.local',
      password: process.env.DIRECTOR_PASSWORD || 'Director123!',
      name: process.env.DIRECTOR_NAME || 'Director',
      role: 'DIRECTOR',
    });
  }

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
