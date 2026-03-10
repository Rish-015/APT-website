"use client"

import { useState } from "react"
import { Sprout, Leaf, Droplets, Thermometer, CloudRain, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const soilTypes = [
  "Clay",
  "Sandy",
  "Loamy",
  "Black Soil",
  "Red Soil",
  "Alluvial Soil",
]

const seasons = ["Kharif", "Rabi", "Zaid"]

const recommendedCrops = [
  {
    name: "Rice (Paddy)",
    confidence: 95,
    yield: "4-5 tonnes/hectare",
    duration: "120-150 days",
    waterRequirement: "High",
    tips: [
      "Ideal for transplanting in June-July",
      "Maintain 5cm water level during vegetative stage",
      "Apply nitrogen fertilizer in 3 split doses"
    ]
  },
  {
    name: "Wheat",
    confidence: 88,
    yield: "3-4 tonnes/hectare",
    duration: "100-120 days",
    waterRequirement: "Medium",
    tips: [
      "Sow in November for best results",
      "Ensure proper drainage to avoid waterlogging",
      "Use certified seeds for better germination"
    ]
  },
  {
    name: "Sugarcane",
    confidence: 75,
    yield: "70-80 tonnes/hectare",
    duration: "10-12 months",
    waterRequirement: "High",
    tips: [
      "Plant setts in spring for optimal growth",
      "Regular irrigation every 7-10 days",
      "Earthing up after 3 months"
    ]
  }
]

export default function CropRecommendationPage() {
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowResults(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Smart Crop Recommendation
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered crop suggestions based on your soil and climate conditions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              Enter Farm Details
            </CardTitle>
            <CardDescription>
              Provide your soil and environmental data for accurate predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="soil">Soil Type</Label>
                <Select>
                  <SelectTrigger id="soil">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((soil) => (
                      <SelectItem key={soil} value={soil.toLowerCase()}>
                        {soil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="e.g., 28"
                    defaultValue="28"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity" className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    Humidity (%)
                  </Label>
                  <Input
                    id="humidity"
                    type="number"
                    placeholder="e.g., 65"
                    defaultValue="65"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rainfall" className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4" />
                    Rainfall (mm)
                  </Label>
                  <Input
                    id="rainfall"
                    type="number"
                    placeholder="e.g., 200"
                    defaultValue="200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph" className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    pH Level
                  </Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 6.5"
                    defaultValue="6.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Season
                </Label>
                <Select>
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season} value={season.toLowerCase()}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Recommendation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {showResults ? (
            <>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on your soil and climate conditions
                  </CardDescription>
                </CardHeader>
              </Card>

              {recommendedCrops.map((crop, index) => (
                <Card key={index} className="transition-all hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                      <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {crop.confidence}% Match
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Expected Yield</p>
                        <p className="font-semibold text-card-foreground">{crop.yield}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Growth Duration</p>
                        <p className="font-semibold text-card-foreground">{crop.duration}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Water Needs</p>
                        <p className="font-semibold text-card-foreground">{crop.waterRequirement}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-card-foreground">Growing Tips:</p>
                      <ul className="space-y-1">
                        {crop.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Sprout className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">No Results Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in the form and click Generate to get crop recommendations
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
