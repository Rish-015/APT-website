import { Users, Wheat, MapPin, Award } from "lucide-react"

interface StatsSectionProps {
  farmers?: string
  varieties?: string
  states?: number
  accuracy?: string
}

export function StatsSection({
  farmers = "50,000+",
  varieties = "200+",
  states = 15,
  accuracy = "95%"
}: StatsSectionProps) {
  const stats = [
    {
      icon: Users,
      value: farmers,
      label: "Active Farmers",
      description: "Trusting our platform daily"
    },
    {
      icon: Wheat,
      value: varieties,
      label: "Crop Varieties",
      description: "Comprehensive database"
    },
    {
      icon: MapPin,
      value: states.toString(),
      label: "States Covered",
      description: "Across India"
    },
    {
      icon: Award,
      value: accuracy,
      label: "Accuracy Rate",
      description: "In crop recommendations"
    }
  ]
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bento-card p-8 text-center flex flex-col items-center justify-center bg-card">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-border">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-extrabold text-foreground lg:text-5xl">
                {stat.value}
              </div>
              <div className="mt-3 text-lg font-bold text-foreground">
                {stat.label}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
