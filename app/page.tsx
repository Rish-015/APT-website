import { LandingNavbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { StatsSection } from "@/components/landing/stats-section"
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { getLandingStats } from "./actions"

export default async function LandingPage() {
  const stats = await getLandingStats()

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection
          farmers={stats.farmers}
          varieties={stats.varieties}
          states={stats.states}
          accuracy={stats.accuracy}
        />
        <TestimonialsCarousel />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
