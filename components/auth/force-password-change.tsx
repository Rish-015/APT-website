"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"
import { updateInitialPassword } from "@/app/actions"
import { toast } from "sonner"

export function ForcePasswordChange() {
  const { data: session, update } = useSession()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Only show if the user must change password
  if (!session?.user?.mustChangePassword) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword === "welcome@123") {
      toast.error("Please choose a different password than the default one.")
      return
    }

    setIsLoading(true)
    try {
      const res = await updateInitialPassword(newPassword)
      if (res.error) throw new Error(res.error)
      
      toast.success("Password updated successfully!")
      // Update session to remove the mustChangePassword flag
      await update({
        ...session,
        user: { ...session.user, mustChangePassword: false }
      })
      // Force a reload to be sure
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Security Requirement</CardTitle>
          <CardDescription>
            For your security, you must change your temporary password before accessing your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button 
                type="submit" 
                className="w-full bg-[#256631] hover:bg-[#1b5e20] text-white font-semibold h-11"
                disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Update Password & Continue"}
            </Button>
            
            <p className="text-center text-xs text-slate-500 italic">
              Password must be at least 6 characters long.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
