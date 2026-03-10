"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { handleInitialPasswordReset } from "@/app/actions"

export function GlobalPasswordReset() {
    const { data: session, update } = useSession()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const mustChange = (session?.user as any)?.mustChangePassword

    useEffect(() => {
        // Force open if Flag is true
        if (mustChange === true) {
            setOpen(true)
        }
    }, [mustChange])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const p1 = formData.get("newPassword") as string
        const p2 = formData.get("confirmPassword") as string

        if (p1 !== p2) {
            toast.error("Passwords do not match!")
            setLoading(false)
            return
        }

        if (p1.length < 6) {
            toast.error("Password must be at least 6 characters.")
            setLoading(false)
            return
        }

        const res = await handleInitialPasswordReset(p1)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Security Update Complete! Welcome to Agro Puthalvan.")
            setOpen(false)
            // Force session refresh so NextAuth drops the lock flag without a relogin
            await update()
            // Hard reload to flush cached layout states
            window.location.reload()
        }
    }

    // Hide entirely if they don't need to change it
    if (!mustChange) return null;

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] outline-none"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="flex flex-col items-center gap-2 pb-2">
                    <div className="bg-amber-100 p-3 rounded-full">
                        <Lock className="text-amber-600 h-6 w-6" />
                    </div>
                    <DialogTitle className="text-xl">Action Required</DialogTitle>
                    <DialogDescription className="text-center text-slate-500">
                        You are logging in with a default or administrative password. For your security, you must create a new password before you can access your dashboard.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Secure Password</Label>
                        <Input id="newPassword" name="newPassword" type="password" required placeholder="••••••••" />
                    </div>
                    <div className="space-y-2 pb-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="••••••••" />
                    </div>

                    <DialogFooter className="sm:justify-stretch">
                        <Button type="submit" className="w-full font-semibold" size="lg" disabled={loading}>
                            {loading ? "Updating Security..." : "Secure My Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
