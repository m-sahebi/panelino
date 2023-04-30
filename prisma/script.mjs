import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  /// Write here

  // const users = await prisma.user.findMany()
  // console.log(users)
  await prisma.user.create({
    data: {
      name: 'mmd',
      email: 'test@test.com',
    },
  });
  await prisma.user.create({
    data: {
      name: 'hamed',
      email: 'test2@test.com',
    },
  });

  /////////////

  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}
