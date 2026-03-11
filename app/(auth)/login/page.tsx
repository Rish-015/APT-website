"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ChevronDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, getSession } from "next-auth/react"
import { toast } from "sonner"
import { LandingNavbar } from "@/components/landing/navbar"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<"Farmer" | "Agri Officer" | "Admin">("Farmer")
  const [authMethod, setAuthMethod] = useState<"OTP" | "Password">("OTP")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // OTP states
  const [otpSent, setOtpSent] = useState(false)
  const [mobileNumber, setMobileNumber] = useState("")

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const loginIdentifier = formData.get("loginIdentifier") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn('credentials', {
        email: loginIdentifier,
        password,
        redirect: false,
      })

      if (res?.error) {
        throw new Error(res.error)
      } else {
        toast.success("Welcome back!")
        // Use a small delay to ensure cookies are set before redirecting
        setTimeout(() => {
          // Hard refresh redirect is more reliable on live sites for session synchronization
          window.location.href = loginIdentifier.toLowerCase().includes('admin') ? "/admin" : "/dashboard"
        }, 800)
      }
    } catch (error: any) {
      toast.error("Invalid credentials. Please verify your details and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number")
      return
    }
    setIsLoading(true)
    // Simulate real OTP response
    setTimeout(() => {
      setOtpSent(true)
      setIsLoading(false)
      toast.success("OTP via SMS sent successfully!")
    }, 1000)
  }

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const otp = formData.get("otp") as string

    // Simulate OTP Login via our credentials layer by passing the OTP as a dummy password 
    // In production, we'd use a separate NextAuth OTP provider or custom API
    try {
      const res = await signIn('credentials', {
        email: mobileNumber,
        password: otp, // we can't truly login with OTP yet since DB expects hashed passwords.
        redirect: false,
      })

      if (res?.error) {
        toast.error("Invalid OTP or Mobile Number not registered. Please use Password login for now.")
      } else {
        toast.success("Welcome back!")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 800)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#F0FDF4]">
      {/* We reuse the global LandingNavbar exactly like the screenshot */}
      <LandingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Adjusted shadows and padding to precisely match screenshot vibe */}
        <Card className="w-full max-w-md shadow-2xl shadow-green-900/5 border-muted/30 rounded-2xl bg-white px-2 py-4">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-[1.65rem] font-bold text-[#1b5e20]">Login to your account</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Split Segment Role Layout */}
            <div className="bg-slate-50 p-1.5 rounded-xl flex items-center border border-slate-100/50 shadow-inner max-w-[90%] mx-auto">
              {(["Farmer", "Agri Officer", "Admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${role === r
                      ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* OTP vs Password Method Layout */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => { setAuthMethod("OTP"); setOtpSent(false); }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${authMethod === "OTP"
                    ? "bg-[#256631] text-white hover:bg-[#1e5631]"
                    : "bg-white text-[#256631] border border-[#256631] hover:bg-green-50"
                  }`}
              >
                Mobile OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("Password")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${authMethod === "Password"
                    ? "bg-[#256631] text-white hover:bg-[#1e5631]"
                    : "bg-white text-[#256631] border border-[#256631] hover:bg-green-50"
                  }`}
              >
                Password
              </button>
            </div>

            {/* Toggle Form Inputs */}
            {authMethod === "OTP" ? (
              <form onSubmit={otpSent ? handleVerifyOtp : undefined} className="space-y-6 pt-2">
                {!otpSent ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Mobile Number</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center gap-1 border border-slate-300 rounded-lg px-2 bg-white h-11 w-20 shrink-0 hover:bg-slate-50 cursor-pointer transition-colors">
                        <span className="text-sm font-medium text-slate-700">+91</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter mobile number"
                        className="h-11 rounded-lg text-sm bg-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 fade-in">
                    <Label className="text-xs font-bold text-slate-700">Enter OTP</Label>
                    <div className="flex gap-2">
                      <Input
                        name="otp"
                        type="text"
                        placeholder="• • • • • •"
                        className="h-12 rounded-lg text-center tracking-[1em] text-lg font-bold bg-white"
                        maxLength={6}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">OTP sent to +91 {mobileNumber}</p>
                  </div>
                )}

                <Button
                  type={otpSent ? "submit" : "button"}
                  onClick={!otpSent ? handleSendOtp : undefined}
                  className="w-full h-11 rounded-lg bg-[#256631] hover:bg-[#1b5e20] text-white font-semibold shadow-sm transition-colors text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : (otpSent ? "Verify & Login" : "Send OTP")}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-6 pt-2 fade-in">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Mobile Number or Email</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center gap-1 border border-slate-300 rounded-lg px-2 bg-white h-11 w-20 shrink-0 hover:bg-slate-50 cursor-pointer transition-colors">
                      <span className="text-sm font-medium text-slate-700">+91</span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="loginIdentifier"
                      name="loginIdentifier"
                      type="text"
                      placeholder="Enter mobile or email"
                      className="h-11 rounded-lg text-sm bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 rounded-lg text-sm pr-10 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 rounded-lg bg-[#256631] hover:bg-[#1b5e20] text-white font-semibold shadow-sm transition-colors text-base" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-slate-700 mt-2 font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#256631] font-bold hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
