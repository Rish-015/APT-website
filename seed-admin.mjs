import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
  })
  
  console.log('Admin account ready:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
