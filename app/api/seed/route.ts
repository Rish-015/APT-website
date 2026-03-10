import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const admin = await prisma.user.findFirst({
            where: { role: "ADMIN" }
        });

        if (admin) {
            return NextResponse.json({ message: "Admin already exists", email: admin.email });
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);
        const newAdmin = await prisma.user.create({
            data: {
                name: "System Admin",
                email: "admin@agro.com",
                password: hashedPassword,
                role: "ADMIN"
            }
        });

        return NextResponse.json({ message: "Admin created", email: newAdmin.email, password: "admin123" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
