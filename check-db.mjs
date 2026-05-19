import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('Tables in public schema:', JSON.stringify(result, null, 2))
  } catch (err) {
    console.error('Diagnostic error:', err)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
