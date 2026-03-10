import { withAuth } from "next-auth/middleware";

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            const path = req.nextUrl.pathname;

            // `/admin` requires admin role
            if (path.startsWith("/admin")) {
                return token?.role === "ADMIN";
            }

            // These routes require any logged-in user
            const protectedRoutes = [
                "/dashboard",
                "/crop-suggestion",
                "/disease-detection",
                "/fertilizer",
                "/community",
                "/profile"
            ];

            if (protectedRoutes.some(route => path.startsWith(route))) {
                return !!token;
            }

            return true;
        },
    },
});

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/crop-suggestion/:path*",
        "/disease-detection/:path*",
        "/fertilizer/:path*",
        "/community/:path*",
        "/profile/:path*"
    ]
};
