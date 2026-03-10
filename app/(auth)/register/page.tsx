"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, MapPin, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATE_DISTRICTS } from "@/lib/data/states-districts"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedState, setSelectedState] = useState<string>("")
  const [districts, setDistricts] = useState<string[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [latitude, setLatitude] = useState<string>("")
  const [longitude, setLongitude] = useState<string>("")
  const [isLocating, setIsLocating] = useState(false)

  const handleStateChange = (value: string) => {
    setSelectedState(value)
    setDistricts(STATE_DISTRICTS[value] || [])
    setSelectedDistrict("")
  }

  const handleGetLocation = () => {
    setIsLocating(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString())
          setLongitude(position.coords.longitude.toString())
          toast.success("Location captured successfully!")
          setIsLocating(false)
        },
        (error) => {
          toast.error("Failed to get location. Please allow location access.")
          setIsLocating(false)
        }
      )
    } else {
      toast.error("Geolocation is not supported by your browser.")
      setIsLocating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const phone = formData.get("phone") as string
    const state = selectedState
    const region = selectedDistrict
    const landSize = formData.get("landSize") as string
    const cropDetails = formData.get("cropDetails") as string

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, phone, state, region, landSize, cropDetails, latitude, longitude })
      });

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Something went wrong")
      }

      // Auto login after creating account
      const signInData = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInData?.error) {
        throw new Error(signInData.error);
      } else {
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Agro Puthalvan Logo"
              width={60}
              height={60}
              unoptimized
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join <span className="notranslate">Agro Puthalvan</span> and start smart farming today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select name="state" value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(STATE_DISTRICTS).map((stateName) => (
                    <SelectItem key={stateName} value={stateName}>
                      {stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region">Region / District</Label>
                <Select name="region" value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder={selectedState ? "Select your district" : "Select a state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landSize">Land Details (e.g. 5 Acres)</Label>
                <Input
                  id="landSize"
                  name="landSize"
                  placeholder="Enter land size or type"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Farm Location Details</Label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="gap-2"
                >
                  {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {latitude && longitude ? "Location Captured" : "Get Current Location"}
                </Button>
              </div>
              {latitude && longitude && (
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-background px-3 py-2 rounded-md border border-border">
                    <span className="font-medium mr-2">Lat:</span>{parseFloat(latitude).toFixed(4)}
                  </div>
                  <div className="bg-background px-3 py-2 rounded-md border border-border">
                    <span className="font-medium mr-2">Lng:</span>{parseFloat(longitude).toFixed(4)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cropDetails">Current Crops (Optional)</Label>
              <Input
                id="cropDetails"
                name="cropDetails"
                placeholder="What crops do you grow? (e.g. Rice, Wheat or 'None')"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
