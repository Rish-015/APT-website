import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sprout, BarChart3, Cloud, Shield } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Hero Content */}
        <div className="mx-auto flex flex-col items-center text-center w-full max-w-5xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <Sprout className="h-4 w-4" />
            Modern Farming Solutions
          </div>

          <h1 className="mb-6 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            Smarter Agriculture for a Better Tomorrow
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground lg:text-xl">
            A clean, data-driven platform providing real-time weather, precise crop recommendations, and market analytics built specifically for modern farmers.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-8 h-12 text-base rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                Get Started
                <Sprout className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base rounded-full bg-background hover:bg-muted hover:text-foreground shadow-sm">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights (Bento Intro) */}
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Sprout,
              title: "Smart Crop Advice",
              description: "AI recommendations"
            },
            {
              icon: Shield,
              title: "Disease Detection",
              description: "Instant analysis"
            },
            {
              icon: Cloud,
              title: "Weather Insights",
              description: "Real-time tracking"
            },
            {
              icon: BarChart3,
              title: "Market Prices",
              description: "Live trend data"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bento-card p-6 flex flex-col items-start bg-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-bold text-base text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
