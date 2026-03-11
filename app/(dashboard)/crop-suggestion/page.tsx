"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sprout, Search, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { fetchWeatherData } from "@/lib/api/weather"

export default function CropSuggestionPage() {
    const [formData, setFormData] = useState({
        N: "",
        P: "",
        K: "",
        pH: "",
        rainfall: "",
        temperature: ""
    })
    const [result, setResult] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { data: session } = useSession()

    useEffect(() => {
        async function prepopulateWeather() {
            const user = session?.user as any;
            if (user?.latitude && user?.longitude) {
                try {
                    const weather = await fetchWeatherData(user.latitude, user.longitude);
                    if (weather?.current?.temperature || weather?.daily?.rainSum?.[0]) {
                        setFormData(prev => ({
                            ...prev,
                            temperature: weather.current?.temperature?.toString() || prev.temperature,
                            rainfall: weather.daily?.rainSum?.[0]?.toString() || prev.rainfall
                        }))
                    }
                } catch (e) {
                    console.error("Failed to pre-fill weather", e);
                }
            }
        }
        prepopulateWeather();
    }, [session])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000"
            const response = await fetch(`${mlApiUrl}/api/predict-crop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    N: Number(formData.N),
                    P: Number(formData.P),
                    K: Number(formData.K),
                    pH: Number(formData.pH),
                    rainfall: Number(formData.rainfall),
                    temperature: Number(formData.temperature)
                })
            })

            const data = await response.json()

            if (data.success) {
                setResult(data.crop)
            } else {
                setError(data.error || "Failed to predict crop")
            }
        } catch (err) {
            setError("Cannot connect to AI Model Service. Make sure python api.py is running on port 5000.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Crop Suggestion System</h1>
                <p className="text-muted-foreground">Enter your soil and weather data to get AI-powered crop recommendations</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-chart-2" />
                            Soil & Weather Parameters
                        </CardTitle>
                        <CardDescription>Fill out the data below as accurately as possible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                <div className="space-y-2">
                                    <Label htmlFor="N">Nitrogen (N)</Label>
                                    <Input id="N" name="N" type="number" step="0.01" required placeholder="e.g. 90" value={formData.N} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="P">Phosphorus (P)</Label>
                                    <Input id="P" name="P" type="number" step="0.01" required placeholder="e.g. 42" value={formData.P} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="K">Potassium (K)</Label>
                                    <Input id="K" name="K" type="number" step="0.01" required placeholder="e.g. 43" value={formData.K} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pH">Soil pH Array</Label>
                                    <Input id="pH" name="pH" type="number" step="0.01" required placeholder="e.g. 6.5" value={formData.pH} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rainfall">Rainfall (in mm) {session?.user && "📍 Auto-filled"}</Label>
                                    <Input id="rainfall" name="rainfall" type="number" step="0.01" required placeholder="e.g. 100" value={formData.rainfall} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="temperature">Temperature (°C) {session?.user && "📍 Auto-filled"}</Label>
                                    <Input id="temperature" name="temperature" type="number" step="0.01" required placeholder="e.g. 28.5" value={formData.temperature} onChange={handleInputChange} />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Prediction Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? "Analyzing..." : "Predict Best Crop"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Sidebar */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Sprout className="h-5 w-5" />
                            AI Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                        {result ? (
                            <>
                                <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                                    <Sprout className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-2xl gap-2 font-extrabold text-foreground">
                                    {result}
                                </h3>
                                <p className="text-sm text-muted-foreground">Is highly recommended for your specific soil and weather conditions.</p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Run a prediction to see the best crop for your conditions here.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
