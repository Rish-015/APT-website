import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { LandingNavbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <LandingNavbar />
        <main className="flex-1 pt-24 pb-12 px-4 md:px-8 container mx-auto fade-in">
          {children}
        </main>
        <Footer />
        <ChatbotWidget />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-6 fade-in">
          {children}
        </main>
      </div>
      <ChatbotWidget />
    </div>
  )
}
