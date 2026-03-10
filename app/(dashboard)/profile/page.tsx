"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, User, MapPin, Sprout, Phone, Mail } from "lucide-react"

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        state: "",
        region: "",
        landSize: "",
        cropDetails: ""
    })

    useEffect(() => {
        if (session?.user) {
            const user = session.user as any
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                state: user.state || "",
                region: user.region || "",
                landSize: user.landSize || "",
                cropDetails: user.cropDetails || ""
            })
        }
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

        try {
            const res = await updateProfile(formData)
            if (res.error) throw new Error(res.error)

            // Trigger NextAuth session refresh to reflect new data in the JWT token locally
            await update()
            toast.success("Profile updated successfully!")
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    if (!session?.user) {
        return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
    }

    const user = session.user as any

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Your Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and farm details.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background">
                            <User className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">{user.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{user.role?.toLowerCase() || "Farmer"}</p>
                        </div>
                        <div className="w-full pt-4 space-y-2 text-sm text-left">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span className="truncate">{user.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="truncate">{user.state ? `${user.region}, ${user.state}` : "Location not set"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Edit Details</CardTitle>
                            <CardDescription>Update your farming context to improve AI recommendations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address <span className="text-xs text-muted-foreground">(Cannot be changed here)</span></Label>
                                    <Input value={user.email || ""} disabled className="bg-muted" />
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mt-2">
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location Defaults</h4>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g. Tamil Nadu" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="region">Region / District</Label>
                                        <Input id="region" name="region" value={formData.region} onChange={handleInputChange} placeholder="e.g. Coimbatore" />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mt-2">
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><Sprout className="h-4 w-4 text-primary" /> Farm Profile</h4>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="landSize">Land Size</Label>
                                        <Input id="landSize" name="landSize" value={formData.landSize} onChange={handleInputChange} placeholder="e.g. 5 Acres" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cropDetails">Current Crops</Label>
                                        <Input id="cropDetails" name="cropDetails" value={formData.cropDetails} onChange={handleInputChange} placeholder="e.g. Rice, Sugarcane" />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t border-border pt-6 pb-6">
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
