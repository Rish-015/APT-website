"use client"

import { useState } from "react"
import { TestTube, Leaf, Sparkles, FlaskConical, Package } from "lucide-react"
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

const cropTypes = [
  "Rice", "Wheat", "Sugarcane", "Cotton", "Maize", "Soybean", "Groundnut", "Vegetables"
]

const fertilizers = [
  {
    name: "Urea (46-0-0)",
    quantity: "120 kg/hectare",
    application: "Split application: 50% at sowing, 25% at 30 days, 25% at 60 days",
    purpose: "Primary nitrogen source for vegetative growth",
    cost: "Rs. 266/50kg bag"
  },
  {
    name: "DAP (18-46-0)",
    quantity: "100 kg/hectare",
    application: "Apply as basal dose at the time of sowing",
    purpose: "Phosphorus for root development and early growth",
    cost: "Rs. 1,350/50kg bag"
  },
  {
    name: "MOP (0-0-60)",
    quantity: "60 kg/hectare",
    application: "Apply 50% as basal and 50% at flowering stage",
    purpose: "Potassium for disease resistance and grain quality",
    cost: "Rs. 1,700/50kg bag"
  },
  {
    name: "Zinc Sulphate",
    quantity: "25 kg/hectare",
    application: "Mix with soil before transplanting",
    purpose: "Essential micronutrient for enzyme activation",
    cost: "Rs. 85/kg"
  }
]

export default function FertilizerPage() {
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
          Fertilizer Recommendation
        </h1>
        <p className="text-muted-foreground">
          Get precise fertilizer suggestions based on your soil nutrient analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Soil Nutrient Analysis
            </CardTitle>
            <CardDescription>
              Enter your soil test results for accurate recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="crop">Crop Type</Label>
                <Select>
                  <SelectTrigger id="crop">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop} value={crop.toLowerCase()}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Field Area (hectares)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  defaultValue="2"
                />
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 text-sm font-semibold text-card-foreground">
                  Soil Nutrient Levels (kg/hectare)
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen" className="text-xs">
                      Nitrogen (N)
                    </Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      placeholder="e.g., 280"
                      defaultValue="280"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phosphorus" className="text-xs">
                      Phosphorus (P)
                    </Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      placeholder="e.g., 45"
                      defaultValue="45"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="potassium" className="text-xs">
                      Potassium (K)
                    </Label>
                    <Input
                      id="potassium"
                      type="number"
                      placeholder="e.g., 210"
                      defaultValue="210"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ph">Soil pH</Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 6.5"
                    defaultValue="6.8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organic">Organic Carbon (%)</Label>
                  <Input
                    id="organic"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 0.5"
                    defaultValue="0.6"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Recommendations
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
                    <FlaskConical className="h-5 w-5" />
                    Fertilizer Plan
                  </CardTitle>
                  <CardDescription>
                    Optimized for Rice cultivation on 2 hectares
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-2xl font-bold text-chart-1">Low</p>
                      <p className="text-xs text-muted-foreground">Nitrogen Status</p>
                    </div>
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-2xl font-bold text-chart-2">Medium</p>
                      <p className="text-xs text-muted-foreground">Phosphorus Status</p>
                    </div>
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-2xl font-bold text-chart-1">High</p>
                      <p className="text-xs text-muted-foreground">Potassium Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {fertilizers.map((fertilizer, index) => (
                <Card key={index} className="transition-all hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="h-5 w-5 text-primary" />
                        {fertilizer.name}
                      </CardTitle>
                      <span className="text-sm font-semibold text-chart-1">
                        {fertilizer.quantity}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Purpose:</p>
                      <p className="text-sm text-muted-foreground">{fertilizer.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Application:</p>
                      <p className="text-sm text-muted-foreground">{fertilizer.application}</p>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                      <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                      <span className="font-semibold text-card-foreground">{fertilizer.cost}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-chart-2/10 border-chart-2/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 shrink-0 text-chart-2" />
                    <div>
                      <p className="font-semibold text-card-foreground">Organic Alternative</p>
                      <p className="text-sm text-muted-foreground">
                        Consider using vermicompost (5 tonnes/hectare) and green manuring 
                        with Sesbania to reduce chemical fertilizer dependency by 25%.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <TestTube className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">No Results Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your soil analysis data to get fertilizer recommendations
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
