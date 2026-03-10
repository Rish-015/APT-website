"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Upload, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createFarmerAdmin, updateFarmerAdmin, bulkImportFarmers, deleteFarmer } from "@/app/actions"

export function AdminAddFarmerModal({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const res = await createFarmerAdmin({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            state: formData.get("state") as string,
            crops: formData.get("crops") as string,
        })

        setLoading(false)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Farmer profile created securely!")
            setOpen(false)
            onRefresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
                    <UserPlus className="h-4 w-4" />
                    Add Farmer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register New Farmer</DialogTitle>
                    <DialogDescription>
                        Create a new farmer account manually. They can log in using their phone/email and default password 'farmer123'.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" required placeholder="Suresh Kumar" />
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile</Label>
                            <Input name="phone" required placeholder="9876543210" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input name="email" type="email" placeholder="suresh@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>State / Region</Label>
                            <Input name="state" required placeholder="Tamil Nadu" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Primary Crops</Label>
                        <Input name="crops" placeholder="Rice, Sugarcane" />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                        {loading ? "Registering..." : "Save Farmer"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function AdminImportCSVModal({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    const handleImport = async () => {
        if (!file) return toast.error("Please select a CSV file first.");
        setLoading(true)

        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target?.result
            if (typeof text === "string") {
                const res = await bulkImportFarmers(text)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success(`Successfully imported ${res.count} farmers!`)
                    setOpen(false)
                    onRefresh()
                }
            }
            setLoading(false)
        }
        reader.readAsText(file)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                    <Upload className="h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bulk Import Farmers</DialogTitle>
                    <DialogDescription>
                        Upload a strict CSV file format containing: <br />
                        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">name, phone, email, state, crops</code>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Button onClick={handleImport} className="w-full" disabled={loading || !file}>
                        {loading ? "Processing CSV..." : "Start Import"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function AdminEditFarmerModal({ farmer, onRefresh, open, setOpen }: any) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const res = await updateFarmerAdmin(farmer.id, {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            state: formData.get("state") as string,
            crops: formData.get("crops") as string,
            status: formData.get("status") as string,
        })

        setLoading(false)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Farmer updated successfully.")
            setOpen(false)
            onRefresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Farmer Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" defaultValue={farmer.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile</Label>
                            <Input name="phone" defaultValue={farmer.email} required placeholder="Mapping bug workaround" />
                        </div>
                        <div className="space-y-2">
                            <Label>State / Region</Label>
                            <Input name="state" defaultValue={farmer.location} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select name="status" defaultValue={farmer.status} className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="active">Active</option>
                                <option value="inactive">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Primary Crops</Label>
                        <Input name="crops" defaultValue={farmer.crops} placeholder="Rice, Sugarcane" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function AdminViewFarmerModal({ farmer, open, setOpen }: any) {
    if (!farmer) return null;
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Farmer Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                        <div>
                            <p className="text-slate-500 font-semibold text-xs">Full Name</p>
                            <p className="font-medium text-slate-900 mt-1">{farmer.name}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold text-xs">Registered Mobile/Email</p>
                            <p className="font-medium text-slate-900 mt-1">{farmer.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold text-xs">Location</p>
                            <p className="font-medium text-slate-900 mt-1">{farmer.location}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold text-xs">Primary Crops</p>
                            <p className="font-medium text-slate-900 mt-1">{farmer.crops}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold text-xs">System Status</p>
                            <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farmer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {farmer.status.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold text-xs">Join Date</p>
                            <p className="font-medium text-slate-900 mt-1">{farmer.joinDate}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
