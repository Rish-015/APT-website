"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DiseaseDetectionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<{ disease: string; remedy: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile)
      setPreview(URL.createObjectURL(droppedFile))
      setResult(null)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000"
      const response = await fetch(`${mlApiUrl}/api/predict-disease`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          disease: data.disease,
          remedy: data.remedy
        })
      } else {
        setError(data.error || "Failed to detect disease")
      }
    } catch (err) {
      setError("Cannot connect to AI Model Service. Make sure python api.py is running on port 5000.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Disease Detection Scanner</h1>
        <p className="text-muted-foreground">Upload a photo of your plant's leaves to instantly diagnose potential diseases and get actionable remedies.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Column */}
        <Card>
          <CardHeader>
            <CardTitle>Image Scanner</CardTitle>
            <CardDescription>Upload a clear image of the affected plant leaf.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!preview ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground">Click or Drag & Drop</h3>
                <p className="text-sm text-muted-foreground mt-1">JPEG, PNG, or WEBP up to 5MB</p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border h-64 bg-black/5 flex items-center justify-center">
                  <img src={preview} alt="Upload preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Scanning via AI..." : "Scan Plant"}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReset} disabled={isLoading}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Scan Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Column */}
        <Card className={result ? "bg-chart-2/5 border-chart-2/20" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Diagnosis Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4 text-muted-foreground animate-pulse">
                <div className="w-16 h-16 rounded-full border-4 border-chart-1 border-t-transparent animate-spin" />
                <p>Analyzing leaf structures and comparing to dataset...</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border">
                  <div className="p-2 rounded-full bg-chart-2/20 shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{result.disease}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">AI Confidence: High</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Recommended Remedy</h4>
                  <div className="p-4 rounded-lg bg-primary/10 text-primary-foreground">
                    <p className="text-sm leading-relaxed text-foreground">{result.remedy}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground px-8">Your analysis report will appear here once the scan is complete.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
