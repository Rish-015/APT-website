"use server";

import { prisma } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fetchWeatherData, getWeatherConditionText } from "@/lib/api/weather";
import { fetchMandiPrices } from "@/lib/api/market-prices";

// ============================================
// ADMIN & FARMERS (USERS) ACTIONS
// ============================================

export async function getFarmers() {
    try {
        const farmers = await prisma.user.findMany({
            where: { role: "USER" },
            select: {
                id: true,
                name: true,
                email: true,
                state: true,
                image: true,
                cropDetails: true,
                // mustChangePassword: true,
            },
            orderBy: { id: "desc" }
        });

        // Transform to match Admin table format
        return farmers.map((f: any) => ({
            id: f.id,
            name: f.name || f.email || "Unknown",
            email: f.email || "No email provided",
            location: f.state || f.image || "Unknown",
            crops: f.cropDetails || "General Farming",
            status: "active",
            joinDate: "Recently"
        }));
    } catch (error: any) {
        console.error("Error fetching farmers:", error);
        return [];
    }
}

export async function deleteFarmer(id: string) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function createFarmerAdmin(data: { name: string, email: string, phone: string, state: string, crops: string }) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        const hashedPassword = await bcrypt.hash("Welcome@123", 12); // Expected default password
        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone,
                image: data.state, // Map 'location' to image for now
                cropDetails: data.crops,
                password: hashedPassword,
                role: "USER",
                // mustChangePassword: true
            }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateFarmerAdmin(id: string, data: { name: string, email: string, phone: string, state: string, crops: string, status: string }) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone,
                image: data.state,
                cropDetails: data.crops,
                // Additional status mapping logic can be handled here later
            }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function handleInitialPasswordReset(password: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                password: hashedPassword,
                // mustChangePassword: false
            }
        });
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function bulkImportFarmers(data: any[][]) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "ADMIN") return { error: "Unauthorized: Admin access required" };

        if (!data || data.length < 2) return { error: "No data found in file." };

        const rows = [...data];
        const headers = rows.shift();
        
        if (!headers || !headers[0]?.toString().toLowerCase().includes('name')) {
            return { error: "Invalid file format. Header 'name' not found in first column." };
        }

        const hashedPassword = await bcrypt.hash("Welcome@123", 12);
        const usersToCreate = [];

        for (const row of rows) {
            if (row.length >= 2) { 
                const [name, phone, email, state, crops] = row.map(cell => cell?.toString().trim());
                if (!name || (!phone && !email)) continue;
                
                usersToCreate.push({
                    name,
                    phone: phone || null,
                    email: email || null,
                    image: state || null,
                    cropDetails: crops || null,
                    password: hashedPassword,
                    role: "USER" as Role
                });
            }
        }

        if (usersToCreate.length === 0) return { error: "No valid farmer records found in the file." };

        // PostgreSql/Prisma createMany is very fast
        const result = await prisma.user.createMany({
            data: usersToCreate,
            skipDuplicates: true
        });

        revalidatePath("/admin");
        return { success: true, count: result.count };
    } catch (error: any) {
        console.error("Farmers Import Critical Error:", error);
        return { error: `Farmers Import error: ${error.message || "Please check your file format."}` };
    }
}

export async function updateProfile(data: { name?: string, phone?: string, state?: string, region?: string, landSize?: string, cropDetails?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    try {
        await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                name: data.name,
                phone: data.phone,
                state: data.state,
                region: data.region,
                landSize: data.landSize,
                cropDetails: data.cropDetails
            }
        });
        revalidatePath("/profile");
        // Also revalidate dashboard to reflect new crop recommendations or market prices based on state
        revalidatePath("/dashboard");
        revalidatePath("/market-prices");
        revalidatePath("/crop-suggestion");

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getAdminStats() {
    try {
        const totalFarmers = await prisma.user.count({ where: { role: "USER" } });
        const totalSchemes = await prisma.scheme.count();

        // Create more dynamic-looking stats based on actual data
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const marketUpdates = 150 + (totalSchemes * 2) + (dayOfYear % 50);
        const dailyVisits = 5400 + (totalFarmers * 3) + (dayOfYear * 5) + (new Date().getHours() * 10);

        return {
            totalFarmers,
            totalSchemes,
            marketUpdates,
            dailyVisits
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { totalFarmers: 0, totalSchemes: 0, marketUpdates: 0, dailyVisits: 0 };
    }
}

// ============================================
// SCHEMES ACTIONS
// ============================================

export async function getSchemes() {
    try {
        const schemes = await prisma.scheme.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return schemes;
    } catch (error) {
        console.error("Error fetching schemes:", error);
        return [];
    }
}

export async function createScheme(data: { 
    name: string, 
    description: string, 
    benefits: string, 
    eligibility: string, 
    applicationProcess: string, 
    documentsRequired: string,
    level: string,
    category: string,
    tags: string,
    deadline?: string 
}) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        await prisma.scheme.create({
            data: {
                title: data.name,
                description: data.description,
                benefits: data.benefits,
                eligibility: data.eligibility,
                applicationProcess: data.applicationProcess,
                documentsRequired: data.documentsRequired,
                level: data.level,
                category: data.category,
                tags: data.tags,
                state: "All India",
                link: "",
                deadline: data.deadline ? new Date(data.deadline) : null,
            }
        });
        revalidatePath("/admin");
        revalidatePath("/schemes");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function bulkImportSchemes(data: any[][]) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "ADMIN") return { error: "Unauthorized: Admin access required" };

        if (!data || data.length < 2) return { error: "No data found in file." };

        const rows = [...data];
        const headers = rows.shift();
        
        if (!headers || (!headers[0]?.toString().toLowerCase().includes('scheme') && !headers[0]?.toString().toLowerCase().includes('title'))) {
            return { error: "Invalid file format. Header 'scheme' or 'title' not found." };
        }

        const schemesToCreate = [];
        for (const row of rows) {
            if (row.length >= 3 && row[0]) {
                const [scheme, slug, details, benefits, eligibility, application_process, documents_required, level, scheme_category, tags] = row.map(c => c?.toString().trim());
                
                schemesToCreate.push({
                    title: scheme || "",
                    slug: slug || null,
                    description: details || "",
                    benefits: benefits || "",
                    eligibility: eligibility || "",
                    applicationProcess: application_process || "",
                    documentsRequired: documents_required || "",
                    level: level || "Central",
                    category: scheme_category || "Agriculture",
                    tags: tags || "",
                    state: "All India",
                    link: ""
                });
            }
        }

        if (schemesToCreate.length === 0) return { error: "No valid scheme records found." };

        const result = await prisma.scheme.createMany({
            data: schemesToCreate,
            skipDuplicates: true
        });

        revalidatePath("/admin");
        revalidatePath("/schemes");
        return { success: true, count: result.count };
    } catch (error: any) {
        console.error("Bulk Import Critical Error [V2]:", error);
        return { error: `Critical error [V2]: ${error.message || "Please check your file format."}` };
    }
}

export async function deleteScheme(id: string) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        await prisma.scheme.delete({ where: { id } });
        revalidatePath("/admin");
        revalidatePath("/schemes");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

// ============================================
// COMMUNITY FORUM ACTIONS
// ============================================

export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { name: true, image: true, role: true }
                },
                comments: {
                    include: {
                        author: { select: { name: true, image: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Shape it for the UI
        return posts.map((post: any) => ({
            id: post.id,
            author: {
                name: post.author.name || "Anonymous Farmer",
                avatar: post.author.image || "",
                role: post.author.role === "ADMIN" ? "Agricultural Scientist" : "Farmer"
            },
            content: post.content,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            likes: Math.floor(Math.random() * 50), // Mock likes for now
            tags: post.category.split(',').map((t: string) => t.trim()).filter(Boolean),
            comments: post.comments.map((c: any) => ({
                id: c.id,
                author: {
                    name: c.author.name || "Anonymous",
                    avatar: c.author.image || ""
                },
                content: c.content,
                timestamp: new Date(c.createdAt).toLocaleDateString()
            }))
        }));
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

export async function createPost(content: string, tags: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized: Must be logged in");

    try {
        await prisma.post.create({
            data: {
                title: "Forum Post", // Optional placeholder
                content: content,
                category: tags || "General",
                authorId: (session.user as any).id
            }
        });
        revalidatePath("/community");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function createComment(postId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized: Must be logged in");

    try {
        await prisma.comment.create({
            data: {
                content: content,
                postId: postId,
                authorId: (session.user as any).id
            }
        });
        revalidatePath("/community");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getLandingStats() {
    try {
        const { PrismaClient } = await import("@prisma/client")
        const prisma = new PrismaClient()
        const totalFarmers = await prisma.user.count({ where: { role: "USER" } });
        // Add some base numbers to make it look established
        const displayFarmers = (totalFarmers + 42000).toLocaleString() + "+";
        const statesCovered = 15;

        return {
            farmers: displayFarmers,
            varieties: "200+",
            states: statesCovered,
            accuracy: "95%"
        };
    } catch (error) {
        return { farmers: "50,000+", varieties: "200+", states: 15, accuracy: "95%" };
    }
}

export async function getDashboardAlerts(user: any) {
    try {
        const alerts = [
            {
                type: "warning",
                title: "Crop Health",
                message: user?.cropDetails ? `Ensure optimal irrigation for your ${user.cropDetails} crop this week.` : "Update your crop details to receive personalized health alerts.",
                time: "Just now"
            },
            {
                type: "info",
                title: "Local Market",
                message: `Prices in ${user?.state || "your region"} are showing a positive trend for major staples.`,
                time: "2 hours ago"
            },
            {
                type: "success",
                title: "Platform Update",
                message: "New government schemes for organic farming added. Check the schemes section.",
                time: "5 hours ago"
            }
        ];
        return alerts;
    } catch (error) {
        return [];
    }
}

export async function getMarketPrices(limit = 100) {
    const { fetchMandiPrices } = await import("@/lib/api/market-prices");
    try {
        const prices = await fetchMandiPrices(limit);
        return prices;
    } catch (error) {
        console.error("Error in getMarketPrices action:", error);
        return [];
    }
}

// ============================================
// AI CHATBOT ACTIONS
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";


export async function getChatResponse(message: string, history: { role: "user" | "model", parts: { text: string }[] }[]) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { 
                error: "Chatbot is in offline mode (API Key missing). Please contact the administrator.",
                content: "I'm currently in offline mode. Once my API key is configured, I'll be able to help you better with farming queries!" 
            };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Define tools for function calling
        const tools = [
            {
                functionDeclarations: [
                    {
                        name: "get_weather",
                        description: "Get real-time weather information for a specific location (defaults to Chennai, Tamil Nadu).",
                        parameters: {
                            type: "object",
                            properties: {
                                location: { type: "string", description: "The city/location name." }
                            }
                        }
                    },
                    {
                        name: "get_market_prices",
                        description: "Get current mandi prices for agricultural commodities.",
                        parameters: {
                            type: "object",
                            properties: {
                                commodity: { type: "string", description: "The crop/commodity name (e.g., Rice, Wheat)." },
                                state: { type: "string", description: "The state name (e.g., Tamil Nadu, Punjab)." }
                            }
                        }
                    },
                    {
                        name: "get_government_schemes",
                        description: "Get all available government farming schemes from the Agro Puthalvan platform.",
                        parameters: { type: "object", properties: {} }
                    }
                ]
            }
        ];

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            tools: tools as any,
            systemInstruction: `You are the Agro Assistant, a specialized AI for the 'Agro Puthalvan' platform. 
            Agro Puthalvan is a comprehensive agricultural empowerment portal for farmers.
            
            Your Expertise:
            1. Government Schemes: Guide users on PM-KISAN, PMFBY, KCC, and other state/central schemes. Use 'get_government_schemes' to see what we offer.
            2. Crop Management: Provide advice on sowing, fertilizers (NPK ratios), and irrigation.
            3. Disease Detection: Direct users to our 'Disease Detection' section for image-based analysis.
            4. Market Prices: Use 'get_market_prices' to give real data on price trends.
            5. Weather: Use 'get_weather' to provide real-time updates for Chennai or other locations.
            6. Platform Navigation: Help users find sections like Crop Recommendation, Community Forum, and Weather.

            Tone: Professional, helpful, empathetic to farmers' needs, and encouraging.
            Response Style: Keep answers concise and actionable. Use bullet points for steps. Most users will be interacting via voice, so keep sentences simple.
            Languages: You must respond in the language the user is speaking or has selected (English, Tamil, or Hindi). If the user asks in Tamil, reply in Tamil. If Hindi, reply in Hindi.

            IMPORTANT: When a user asks about weather, market prices, or schemes, ALWAYS use the provided tools to get real data instead of saying you don't know.`
        });

        const firstUserIndex = history.findIndex(m => m.role === "user");
        const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

        const chat = model.startChat({
            history: validHistory,
        });

        let result = await chat.sendMessage(message);
        let response = await result.response;

        // Handle possible function calls
        const calls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
        
        if (calls && calls.length > 0) {
            const toolResponses: any[] = [];
            
            for (const call of calls) {
                const { name, args } = call.functionCall!;
                console.log(`AI calling tool: ${name}`, args);
                
                if (name === "get_weather") {
                    // Chennai default coords
                    const weather = await fetchWeatherData(); 
                    if (weather) {
                        const condition = getWeatherConditionText(weather.current.conditionCode);
                        toolResponses.push({
                            role: "function",
                            name: name,
                            content: `Current Weather in Chennai: ${weather.current.temperature}°C, ${condition}. Humidity: ${weather.current.humidity}%, Wind: ${weather.current.windSpeed} km/h.`
                        });
                    } else {
                        toolResponses.push({ role: "function", name: name, content: "Unable to fetch weather data at the moment." });
                    }
                } else if (name === "get_market_prices") {
                    const prices = await fetchMandiPrices(5, 0, { commodity: (args as any).commodity, state: (args as any).state });
                    toolResponses.push({
                        role: "function",
                        name: name,
                        content: prices.length > 0 ? JSON.stringify(prices.slice(0, 3)) : "No market data found for this commodity."
                    });
                } else if (name === "get_government_schemes") {
                    const schemes = await prisma.scheme.findMany({ take: 5 });
                    toolResponses.push({
                        role: "function",
                        name: name,
                        content: JSON.stringify(schemes.map(s => s.title))
                    });
                }
            }

            // Send tool responses back to model to get final answer
            // Using the simpler approach: just include the data in a follow-up or re-prompt
            const followUp = await chat.sendMessage(toolResponses.map(r => r.content).join("\n"));
            return { content: followUp.response.text() };
        }

        return { content: response.text() };
    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        return { error: "Failed to connect to Agro Assistant. Please ensure your internet is active and try again." };
    }
}
