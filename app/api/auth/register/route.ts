import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { firstName, lastName, phone, email, state, region, landSize, cropDetails, latitude, longitude, password } = await req.json();

        if (!firstName || !phone || !password) {
            return new NextResponse(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400 }
            );
        }

        // Check if user exists (checking by email if provided, or phone)
        const existingEmailUser = email ? await prisma.user.findUnique({
            where: { email }
        }) : null;

        if (existingEmailUser) {
            return new NextResponse(
                JSON.stringify({ error: "Email already in use" }),
                { status: 409 }
            );
        }

        const existingPhoneUser = phone ? await prisma.user.findFirst({
            where: { phone }
        }) : null;

        if (existingPhoneUser) {
            return new NextResponse(
                JSON.stringify({ error: "Phone number already registered" }),
                { status: 409 }
            );
        }

        // Create the User in the Database
        const hashedPassword = await bcrypt.hash(password, 12);
        const fullName = `${firstName} ${lastName}`.trim();

        const user = await prisma.user.create({
            data: {
                name: fullName,
                email: email || null,
                phone: phone || null,
                state: state || null,
                region: region || null,
                landSize: landSize || null,
                cropDetails: cropDetails || null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                password: hashedPassword,
                role: email === "admin@agro.com" ? "ADMIN" : "USER",
            }
        });

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error("REGISTRATION_ERROR:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal Error" }),
            { status: 500 }
        );
    }
}
