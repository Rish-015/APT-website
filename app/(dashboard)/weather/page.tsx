"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Loader2, CloudSun, Thermometer, Droplets, Wind, CloudRain, Sun, Cloud, Sunrise, Sunset, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { fetchWeatherData, getWeatherConditionText, WeatherData } from "@/lib/api/weather"
import { useSession } from "next-auth/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const INDIAN_LOCATIONS = {
  "Tamil Nadu": [
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
    { name: "Madurai", lat: 9.9252, lon: 78.1198 },
    { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047 },
    { name: "Salem", lat: 11.6643, lon: 78.1460 },
  ],
  "Maharashtra": [
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
    { name: "Nashik", lat: 20.0110, lon: 73.7903 },
  ],
  "Karnataka": [
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Mysuru", lat: 12.2958, lon: 76.6394 },
    { name: "Hubballi", lat: 15.3647, lon: 75.1240 },
    { name: "Mangaluru", lat: 12.9141, lon: 74.8560 },
  ],
  "Gujarat": [
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
    { name: "Surat", lat: 21.1702, lon: 72.8311 },
    { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
    { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
  ],
  "Punjab": [
    { name: "Ludhiana", lat: 30.9010, lon: 75.8573 },
    { name: "Amritsar", lat: 31.6340, lon: 74.8723 },
    { name: "Jalandhar", lat: 31.3260, lon: 75.5762 },
    { name: "Patiala", lat: 30.3398, lon: 76.3869 },
  ],
  "Haryana": [
    { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
    { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
    { name: "Panipat", lat: 29.3909, lon: 76.9635 },
    { name: "Ambala", lat: 30.3782, lon: 76.7767 },
  ],
  "Uttar Pradesh": [
    { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
    { name: "Agra", lat: 27.1767, lon: 78.0081 },
    { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  ]
};

function getWeatherIcon(condition: string) {
  const cond = condition.toLowerCase();
  if (cond.includes("sun") || cond.includes("clear")) return Sun;
  if (cond.includes("cloud") && !cond.includes("partly")) return Cloud;
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("thunder")) return CloudRain;
  return CloudSun;
}

export default function WeatherPage() {
  const { data: session, status } = useSession()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [selectedState, setSelectedState] = useState<string>("Tamil Nadu")
  const [selectedCity, setSelectedCity] = useState<string>("Chennai")
  const [location, setLocation] = useState("Chennai, Tamil Nadu")

  useEffect(() => {
    async function loadWeather() {
      setIsLoading(true)
      try {
        let lat = 13.0827
        let lon = 80.2707
        let locName = "Chennai, Tamil Nadu"

        if (status === "authenticated" && session?.user) {
          const user = session.user as any
          if (user.latitude && user.longitude) {
            lat = parseFloat(user.latitude)
            lon = parseFloat(user.longitude)
            locName = `${user.region || 'Unknown'}, ${user.state || 'Unknown'}`
          }
        } else {
          // Unauthenticated or no coords, use selected state/city
          const stateData = INDIAN_LOCATIONS[selectedState as keyof typeof INDIAN_LOCATIONS]
          if (stateData) {
            const cityData = stateData.find(c => c.name === selectedCity)
            if (cityData) {
              lat = cityData.lat
              lon = cityData.lon
              locName = `${cityData.name}, ${selectedState}`
            }
          }
        }

        setLocation(locName)
        const data = await fetchWeatherData(lat, lon)
        if (data) {
          setWeatherData(data)
        }
      } catch (error) {
        console.error("Error loading weather data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      loadWeather()
    }
  }, [status, session, selectedState, selectedCity])

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Fetching real-time weather data...</p>
        </div>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-destructive">Failed to load weather data. Please try again later.</p>
      </div>
    )
  }

  // Formatting Current Weather
  const currentCondition = getWeatherConditionText(weatherData.current.conditionCode)
  const CurrentIcon = getWeatherIcon(currentCondition)

  // Formatting Hourly (Next 24 hours)
  const currentHourIndex = weatherData.hourly.time.findIndex(t => new Date(t) >= new Date())
  const next24Hours = weatherData.hourly.time.slice(currentHourIndex, currentHourIndex + 24).map((time, i) => ({
    time: format(new Date(time), "ha"),
    temp: weatherData.hourly.temperature[currentHourIndex + i],
    humidity: weatherData.hourly.humidity[currentHourIndex + i],
  }))

  // Formatting Weekly (Next 7 days)
  const weeklyForecast = weatherData.daily.time.map((time, i) => ({
    day: i === 0 ? "Today" : format(new Date(time), "EEE"),
    high: Math.round(weatherData.daily.temperatureMax[i]),
    low: Math.round(weatherData.daily.temperatureMin[i]),
    condition: getWeatherConditionText(weatherData.daily.weatherCode[i]),
    rainfall: weatherData.daily.rainSum[i],
  }))

  // Formatting Weekly Rainfall for Chart
  const dynamicRainfallData = weatherData.daily.time.map((time, i) => ({
    day: i === 0 ? "Today" : format(new Date(time), "EEE"),
    rainfall: weatherData.daily.rainSum[i],
  }))

  // Format Sunrise and Sunset for today
  const todaySunrise = format(new Date(weatherData.daily.sunrise[0]), "h:mm a")
  const todaySunset = format(new Date(weatherData.daily.sunset[0]), "h:mm a")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Weather Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time weather data and forecasts for your farming area
          </p>
        </div>

        {status !== "loading" && status !== "authenticated" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedState} onValueChange={(val) => {
              setSelectedState(val);
              // reset city to first city in new state
              const firstCity = INDIAN_LOCATIONS[val as keyof typeof INDIAN_LOCATIONS][0].name;
              setSelectedCity(firstCity);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(INDIAN_LOCATIONS).map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_LOCATIONS[selectedState as keyof typeof INDIAN_LOCATIONS]?.map((city) => (
                  <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Current Weather */}
      <Card className="bg-primary/5 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <CurrentIcon className="h-12 w-12 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {location}
                </div>
                <div className="text-5xl font-bold text-card-foreground">
                  {Math.round(weatherData.current.temperature)}°C
                </div>
                <p className="text-lg text-muted-foreground">{currentCondition}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col items-center rounded-lg bg-background p-4 shadow-sm border border-border">
                <Droplets className="h-6 w-6 text-chart-3" />
                <span className="mt-2 text-2xl font-bold text-card-foreground">{Math.round(weatherData.current.humidity)}%</span>
                <span className="text-xs text-muted-foreground">Humidity</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-background p-4 shadow-sm border border-border">
                <Wind className="h-6 w-6 text-chart-5" />
                <span className="mt-2 text-2xl font-bold text-card-foreground">{Math.round(weatherData.current.windSpeed)}</span>
                <span className="text-xs text-muted-foreground">km/h Wind</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-background p-4 shadow-sm border border-border">
                <Sunrise className="h-6 w-6 text-chart-4" />
                <span className="mt-2 text-lg font-bold text-card-foreground">{todaySunrise}</span>
                <span className="text-xs text-muted-foreground">Sunrise</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-background p-4 shadow-sm border border-border">
                <Sunset className="h-6 w-6 text-chart-2" />
                <span className="mt-2 text-lg font-bold text-card-foreground">{todaySunset}</span>
                <span className="text-xs text-muted-foreground">Sunset</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              24-Hour Forecast
            </CardTitle>
            <CardDescription>Hourly temperature and humidity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={next24Hours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    interval={3}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                    name="Temperature (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={false}
                    name="Humidity (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rainfall Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5" />
              7-Day Rainfall Forecast
            </CardTitle>
            <CardDescription>Expected precipitation over the next week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicRainfallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Bar
                    dataKey="rainfall"
                    fill="var(--chart-3)"
                    radius={[4, 4, 0, 0]}
                    name="Rainfall (mm)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
          <CardDescription>Weather outlook for the upcoming week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {weeklyForecast.map((day, index) => {
              const Icon = getWeatherIcon(day.condition)
              return (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <span className="font-semibold text-card-foreground">{day.day}</span>
                  <Icon className="my-3 h-8 w-8 text-primary" />
                  <div className="text-center">
                    <span className="text-lg font-bold text-card-foreground">{day.high}°</span>
                    <span className="text-muted-foreground"> / {day.low}°</span>
                  </div>
                  <span className="mt-1 text-xs text-center text-muted-foreground leading-tight">{day.condition}</span>
                  {day.rainfall > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-chart-3 font-medium">
                      <CloudRain className="h-3 w-3" />
                      {day.rainfall}mm
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Farming Advisory */}
      <Card className="bg-chart-2/10 border-chart-2/30">
        <CardHeader>
          <CardTitle className="text-chart-2">Weather-Based Farming Advisory</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CloudRain className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
              <span><strong>Rain Alert:</strong> Evaluate local drainage systems; expected rainfall is noted in the weekly forecast.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sun className="mt-0.5 h-4 w-4 shrink-0 text-chart-4" />
              <span><strong>Ideal Conditions:</strong> Leverage clear days for applying necessary soil treatments or harvesting dry crops.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
              <span><strong>Irrigation:</strong> Adjust irrigation schedules based on the next 24 hours humidity and temperature peaks.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
