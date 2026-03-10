import {
  Wheat,
  Leaf,
  TestTube,
  CloudSun,
  TrendingUp,
  FileText,
  Users,
  MessageSquare,
  Bot
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Wheat,
    title: "Smart Crop Recommendation",
    description: "Get personalized crop suggestions based on your soil type, weather conditions, and seasonal factors using advanced AI algorithms.",
    color: "text-chart-1"
  },
  {
    icon: Leaf,
    title: "Plant Disease Detection",
    description: "Upload images of your crops and get instant AI-powered disease identification with treatment recommendations.",
    color: "text-chart-2"
  },
  {
    icon: TestTube,
    title: "Fertilizer Recommendations",
    description: "Receive precise fertilizer suggestions based on soil nutrient analysis to maximize crop yield and minimize costs.",
    color: "text-chart-3"
  },
  {
    icon: CloudSun,
    title: "Weather Monitoring",
    description: "Access real-time weather data, forecasts, and alerts to plan your farming activities effectively.",
    color: "text-chart-4"
  },
  {
    icon: TrendingUp,
    title: "Market Price Tracker",
    description: "Track live crop prices across markets, analyze trends, and make informed decisions on when and where to sell.",
    color: "text-chart-5"
  },
  {
    icon: FileText,
    title: "Government Schemes",
    description: "Stay updated on agricultural subsidies, schemes, and programs. Check eligibility and apply directly.",
    color: "text-chart-1"
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Connect with fellow farmers, share experiences, ask questions, and learn from agricultural experts.",
    color: "text-chart-2"
  },
  {
    icon: MessageSquare,
    title: "Multi-language Support",
    description: "Access the platform in multiple regional languages including Tamil, Hindi, and English.",
    color: "text-chart-3"
  },
  {
    icon: Bot,
    title: "AI Farming Assistant",
    description: "Get instant answers to your farming queries through our intelligent chatbot available 24/7.",
    color: "text-chart-4"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 lg:py-32 bg-background border-y border-border/50">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything You Need for Smart Farming
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive, data-driven toolkit designed to improve your agricultural productivity and yield.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:auto-rows-[250px]">

          {/* Feature 1 (Large Square) */}
          <div className="bento-card bg-card p-6 md:p-8 flex flex-col justify-between md:col-span-2 md:row-span-2 group">
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                <Wheat className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">Smart Crop Recommendation</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Get personalized crop suggestions based on your soil type, weather conditions, and seasonal factors using our advanced AI models. Overcome uncertainty with data.
              </p>
            </div>
          </div>

          {/* Feature 2 (Wide Rectangle) */}
          <div className="bento-card bg-card p-6 flex flex-col justify-between md:col-span-2 group">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:scale-105 transform">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Plant Disease Detection</h3>
              <p className="text-muted-foreground text-sm">
                Upload images of your crops and get instant AI-powered disease identification with treatment recommendations.
              </p>
            </div>
          </div>

          {/* Feature 3 (Small Square) */}
          <div className="bento-card bg-card p-6 flex flex-col justify-between group">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:scale-105 transform">
                <TestTube className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Soil & Fertilizer</h3>
              <p className="text-muted-foreground text-sm">Precise nutrient analysis to maximize yield.</p>
            </div>
          </div>

          {/* Feature 4 (Small Square) */}
          <div className="bento-card bg-card p-6 flex flex-col justify-between group">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:scale-105 transform">
                <CloudSun className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Weather Alerts</h3>
              <p className="text-muted-foreground text-sm">Real-time forecasts to plan activities.</p>
            </div>
          </div>

          {/* Feature 5 (Wide Rectangle) */}
          <div className="bento-card bg-card p-6 flex flex-col justify-between md:col-span-2 group">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:scale-105 transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Market Price Tracker</h3>
              <p className="text-muted-foreground text-sm">
                Track live crop prices across markets, analyze supply trends, and make informed decisions on selling.
              </p>
            </div>
          </div>

          {/* Feature 6 (Medium Rectangle) */}
          <div className="bento-card bg-card p-6 flex flex-col justify-between md:col-span-2 group">
            <div className="flex gap-4">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:scale-105 transform">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">AI Farming Assistant</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant answers to your farming queries through our intelligent chatbot available 24/7 in multiple languages.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
