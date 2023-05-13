import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  /// Write here

  // await prisma.user.create({
  //   data: {
  //     name: 'Mmd',
  //     email: 'mmd@test.com',
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     name: 'Hamed',
  //     email: 'hamed@test.com',
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     name: 'Salar',
  //     email: 'salar@test.com',
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     name: 'Mahmoud',
  //     email: 'msa.prog@gmail.com',
  //   },
  // });
  //
  // await prisma.post.create({data:{
  //     title:'First post of the site!',
  //     content:'This is the content.',
  //     author:{
  //       connect:{email:'mmd@test.com'}
  //     }
  //   }})
  //
  // await prisma.post.create({data:{
  //   title:'Second post of the site!',
  //     content:'That is the content.',
  //     author:{
  //     connect:{email:'mmd@test.com'}
  //     }
  // }})

  /////////////

  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}
