import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  // Clean up existing data
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Seed Departments
  const activation    = await prisma.department.create({ data: { name: 'Activation' } });
  const hr            = await prisma.department.create({ data: { name: 'HR' } });
  const finance       = await prisma.department.create({ data: { name: 'Finance' } });
  const clientService = await prisma.department.create({ data: { name: 'Client Servicing' } });
  const creative      = await prisma.department.create({ data: { name: 'Creative' } });
  const ee            = await prisma.department.create({ data: { name: 'E & E' } });
  await prisma.department.create({ data: { name: 'General' } });

  // Seed Users
  const admin = await prisma.user.create({
    data: {
      name:         'Admin User',
      email:        'admin@mone.com',
      role:         'SUPER_ADMIN',
      password:     hashPassword('admin123'),
      departmentId: hr.id,
      isActive:     true,
    },
  });



  // Helper date functions
  function today(hour: number, minute = 0) {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  function daysFromNow(days: number, hour: number, minute = 0) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  function dateOnly(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Seed Bookings
  await prisma.booking.createMany({
    data: [
      {
        userId:       admin.id,
        departmentId: activation.id,
        description:  'Interview',
        startTime:    today(9, 30),
        endTime:      today(10, 30),
        date:         dateOnly(0),
        isActive:     true,
        createdAt:    daysFromNow(-3, 10),
      },
    ],
  });

  console.log('✅ Database seeded successfully');
  console.log(`   Admin: ${admin.email} / admin123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
