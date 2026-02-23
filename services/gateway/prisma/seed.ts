import { PrismaClient, Role, AccountStatus } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@datasonar.io' },
    update: {},
    create: {
      email: 'admin@datasonar.io',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });
  console.log(`  ✅ Admin user created: ${admin.email}`);

  // Create demo viewer user
  const viewerPassword = await bcrypt.hash('viewer123!', 12);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@datasonar.io' },
    update: {},
    create: {
      email: 'viewer@datasonar.io',
      passwordHash: viewerPassword,
      firstName: 'Demo',
      lastName: 'Viewer',
      role: Role.VIEWER,
      status: AccountStatus.ACTIVE,
    },
  });
  console.log(`  ✅ Viewer user created: ${viewer.email}`);

  // Create demo pipelines
  const pipelines = [
    {
      name: 'orders-etl',
      description: 'ETL pipeline for the orders database',
      sourceType: 'database',
      sourceConfig: { host: 'orders-db', port: 5432, database: 'orders' },
    },
    {
      name: 'user-events-stream',
      description: 'Real-time user activity event stream',
      sourceType: 'stream',
      sourceConfig: { topic: 'user-events', broker: 'kafka:9092' },
    },
    {
      name: 'payment-api-sync',
      description: 'Payment gateway API data sync',
      sourceType: 'api',
      sourceConfig: { endpoint: 'https://api.payments.com/v2/transactions' },
    },
  ];

  for (const pipeline of pipelines) {
    await prisma.pipeline.upsert({
      where: { name: pipeline.name },
      update: {},
      create: pipeline,
    });
    console.log(`  ✅ Pipeline created: ${pipeline.name}`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin:  admin@datasonar.io  / admin123!');
  console.log('  Viewer: viewer@datasonar.io / viewer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });