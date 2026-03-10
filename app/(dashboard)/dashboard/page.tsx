import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  Sprout,
  CloudSun,
  TrendingUp,
  BarChart3,
  Bell,
  AlertTriangle,
  Droplets,
  Thermometer,
  Wind
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { fetchWeatherData, getWeatherConditionText } from "@/lib/api/weather"


import { getDashboardAlerts } from "@/app/actions"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  const alerts = await getDashboardAlerts(user)

  // Default to Chennai if no coordinates provided
  const lat = user?.latitude || 13.0827
  const lon = user?.longitude || 80.2707

  const weatherData = await fetchWeatherData(lat, lon)

  const currentTemp = weatherData?.current?.temperature ? `${Math.round(weatherData.current.temperature)}°C` : "28°C"
  const currentCondition = weatherData?.current?.conditionCode !== undefined
    ? getWeatherConditionText(weatherData.current.conditionCode)
    : "Partly cloudy"
  const humidity = weatherData?.current?.humidity ? `${Math.round(weatherData.current.humidity)}%` : "65%"
  const windSpeed = weatherData?.current?.windSpeed ? `${Math.round(weatherData.current.windSpeed)} km/h` : "12 km/h"
  const rainfall = weatherData?.daily?.rainSum?.[0] ? `${weatherData.daily.rainSum[0]} mm` : "0 mm"

  // formatting
  const cropRecs = user?.cropDetails && user.cropDetails.toLowerCase() !== "none" && user.cropDetails.toLowerCase() !== "no crop"
    ? user.cropDetails
    : "Rice, Wheat"

  const marketLocation = user?.region || user?.state || "Local Market"

  const dynamicSummaryCards = [
    {
      title: "Crop Details",
      description: user?.cropDetails ? "Your listed crops" : "AI-powered crop suggestions",
      icon: Sprout,
      href: "/crop-suggestion",
      value: cropRecs,
      subtitle: user?.cropDetails ? "Actively growing" : "Best suited for your soil",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10"
    },
    {
      title: "Weather Today",
      description: "Current conditions at farm",
      icon: CloudSun,
      href: "/weather",
      value: currentTemp,
      subtitle: currentCondition,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10"
    },
    {
      title: "Market Price",
      description: `Prices in ${marketLocation}`,
      icon: TrendingUp,
      href: "/market-prices",
      value: "Check Rates",
      subtitle: "Click to view updates",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10"
    },
    {
      title: "Farm Analytics",
      description: "Overall health score",
      icon: BarChart3,
      href: "/analytics",
      value: user?.cropDetails ? "88%" : "72%",
      subtitle: user?.cropDetails ? "Healthy growth" : "Incomplete profile",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10"
    }
  ]

  const dynamicWeatherMetrics = [
    { label: "Temperature", value: currentTemp, icon: Thermometer },
    { label: "Humidity", value: humidity, icon: Droplets },
    { label: "Wind Speed", value: windSpeed, icon: Wind },
    { label: "Rainfall", value: rainfall, icon: CloudSun },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here is an overview of your farm and latest updates.
          </p>
        </div>
        <Link href="/crop-suggestion">
          <Button>
            <Sprout className="mr-2 h-4 w-4" />
            Get Crop Advice
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicSummaryCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <Card className="transition-all hover:shadow-lg hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts & Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Smart Alerts
              </CardTitle>
              <CardDescription>Recent notifications and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  <div className={`rounded-full p-2 ${alert.type === "warning"
                    ? "bg-chart-4/10 text-chart-4"
                    : alert.type === "success"
                      ? "bg-chart-1/10 text-chart-1"
                      : "bg-chart-3/10 text-chart-3"
                    }`}>
                    {alert.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-card-foreground">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Weather */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="h-5 w-5" />
              Weather Overview
            </CardTitle>
            <CardDescription>Current conditions in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dynamicWeatherMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <metric.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <span className="font-semibold text-card-foreground">{metric.value}</span>
                </div>
              ))}
            </div>
            <Link href="/weather">
              <Button variant="outline" className="mt-4 w-full">
                View Full Forecast
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/crop-suggestion">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Sprout className="h-4 w-4" />
                Crop Recommendation
              </Button>
            </Link>
            <Link href="/disease-detection">
              <Button variant="outline" className="w-full justify-start gap-2">
                <AlertTriangle className="h-4 w-4" />
                Detect Disease
              </Button>
            </Link>
            <Link href="/market-prices">
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Check Prices
              </Button>
            </Link>
            <Link href="/schemes">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                View Schemes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
