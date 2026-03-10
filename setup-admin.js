const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    try {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) {
            console.log("ADMIN_EXISTS:" + admin.email)
        } else {
            const hashedPassword = await bcrypt.hash("admin123", 10)
            const newAdmin = await prisma.user.create({
                data: {
                    name: "System Admin",
                    email: "admin@agro.com",
                    password: hashedPassword,
                    role: "ADMIN"
                }
            })
            console.log("CREATED_ADMIN:" + newAdmin.email)
        }
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
