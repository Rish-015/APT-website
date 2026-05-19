const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin@123", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "admin@agro.com" },
    update: {
        password: hashedPassword,
        role: "ADMIN",
        isApproved: true
    },
    create: {
      email: "admin@agro.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      isApproved: true,
      mustChangePassword: false
    }
  });
  
  console.log('Admin account created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
