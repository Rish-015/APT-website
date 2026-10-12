"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, RefreshCw, AlertCircle, CheckCircle2, Volume2, ShieldCheck, Stethoscope } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { detectDiseaseAction } from "@/app/actions"
import { toast } from "sonner"

interface DiagnosisResult {
  disease: string
  solution: string
  prevention: string
  confidence?: number
  remainingRequests?: number
}

export default function DiseaseDetectionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

  const getCurrentLanguage = () => {
    if (typeof document === 'undefined') return "English"
    const googtrans = document.cookie.split('; ').find(row => row.startsWith('googtrans='))
    if (googtrans) {
      const lang = googtrans.split('=')[1].split('/').pop() || "en"
      if (lang === 'ta') return "Tamil"
      if (lang === 'hi') return "Hindi"
    }
    return "English"
  }

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const lang = getCurrentLanguage()
    const isTamil = lang === "Tamil" || /[\u0B80-\u0BFF]/.test(text)
    const isHindi = lang === "Hindi" || /[\u0900-\u097F]/.test(text)

    if (isTamil || isHindi) {
      const langCode = isTamil ? "ta" : "hi"
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}`
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.play().catch(console.warn)
      return
    }

    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-IN"
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const handleSubmit = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Convert file to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      const base64Image = await base64Promise

      const language = getCurrentLanguage()
      const formData = new FormData()
      formData.append("base64Image", base64Image)
      formData.append("language", language)
      const response = await detectDiseaseAction(formData)

      if (response.success && response.disease) {
        setResult({
          disease: response.disease,
          solution: response.solution || "No specific remedy provided.",
          prevention: response.prevention || "General good farming practices are recommended.",
          confidence: response.confidence,
          remainingRequests: response.remainingRequests,
        })
        toast.success("Crop analysis complete!")
      } else {
        setError(response.error || "Failed; no leaf detected or analysis error.")
        if (response.error?.includes("No leaf detected")) {
          toast.error("Leaf detection failed.")
        }
      }
    } catch (err) {
      setError("AI Analysis failed. Please try again later.")
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
    window.speechSynthesis.cancel()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">AI Disease Scanner</h1>
          <p className="text-muted-foreground">Diagnose crop diseases instantly with AI-powered botanical scanning and treatment guidance.</p>
        </div>
        <Button variant="outline" className="w-fit" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Scanner
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Column */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Upload className="h-5 w-5" /> Image Input
            </CardTitle>
            <CardDescription>Upload a clear photo of the plant leaf (diseased or healthy).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!preview ? (
              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center hover:bg-primary/10 transition-all cursor-pointer group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Click or Drag & Drop</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">Upload a clear leaf image up to 10MB (JPEG, PNG, WEBP)</p>
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 h-80 bg-black/5 flex items-center justify-center shadow-inner">
                  <img src={preview} alt="Upload preview" className="max-h-full max-w-full object-contain" />
                </div>
                <Button className="w-full h-12 text-lg shadow-lg hover:shadow-primary/20 transition-all" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Analyzing Leaf...
                    </>
                  ) : "Detect Disease"}
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="animate-in fade-in duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Column */}
        <Card className={cn("transition-all duration-500", result ? "bg-chart-2/5 border-chart-2/30 shadow-lg" : "border-muted bg-muted/20 opacity-80")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ImageIcon className="h-5 w-5 text-chart-2" />
              Diagnosis Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex flex-col items-center justify-center space-y-6 text-muted-foreground">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-chart-2 border-t-transparent animate-spin" />
                  <Stethoscope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-chart-2 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-foreground">AI is examining the image...</p>
                  <p className="text-sm">Identifying patterns and symptoms...</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-background border-2 border-chart-2/20 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle2 className="h-16 w-16 text-chart-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-chart-2/10 shrink-0">
                    <ShieldCheck className="h-6 w-6 text-chart-2" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-chart-2/15 text-chart-2 border border-chart-2/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse" />
                        AI Verified
                      </span>
                      {typeof result.confidence === "number" && result.confidence > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {(result.confidence * 100).toFixed(1)}% Confidence
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-foreground leading-snug">{result.disease}</h3>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-3 bg-background p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" /> Recommended Solution
                      </h4>
                      <Button variant="secondary" size="sm" onClick={() => speak(result.solution)} className="h-8 gap-2">
                        <Volume2 className="h-4 w-4" /> Listen
                      </Button>
                    </div>
                    <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {result.solution}
                    </div>
                  </div>

                  <div className="space-y-3 bg-chart-5/5 p-5 rounded-xl border border-chart-5/20 shadow-sm">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-chart-5" /> Prevention & Causes
                    </h4>
                    <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {result.prevention}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-6 rounded-full bg-muted/50 border border-muted ring-8 ring-muted/20">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">Waiting for Scan</p>
                  <p className="text-sm text-muted-foreground px-12">Submit an image of your plant leaf to generate a comprehensive health report here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
