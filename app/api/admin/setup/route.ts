import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash("admin@123", 12);
        
        const user = await prisma.user.upsert({
            where: { email: "admin@agro.com" },
            update: {
                password: hashedPassword,
                role: "ADMIN",
                isApproved: true,
                mustChangePassword: false
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

        return NextResponse.json({
            message: "Admin account ready",
            email: user.email,
            password: "admin@123 (use this to login)"
        });
    } catch (error: any) {
        console.error("SETUP_ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
