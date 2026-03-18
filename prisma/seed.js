const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  const users = [
    { name: 'Admin', email: 'admin@teste.com', password, role: 'ADMIN' },
    { name: 'Finance', email: 'financeiro@teste.com', password, role: 'FINANCE' },
    { name: 'Marketing', email: 'marketing@teste.com', password, role: 'MARKETING' },
    { name: 'Operator', email: 'operador@teste.com', password, role: 'OPERATOR' },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created/updated user: ${user.name} (${user.role})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
