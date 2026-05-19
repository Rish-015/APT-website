"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Upload, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createFarmerAdmin, updateFarmerAdmin, bulkImportFarmers, deleteFarmer } from "@/app/actions"
import * as XLSX from "xlsx"

import { STATE_DISTRICTS } from "@/lib/data/states-districts"

export function AdminAddFarmerModal({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedState, setSelectedState] = useState("")
    const [selectedDistrict, setSelectedDistrict] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const res = await createFarmerAdmin({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            state: selectedState,
            region: selectedDistrict || (formData.get("region") as string),
            landSize: formData.get("landSize") as string,
            cropDetails: formData.get("cropDetails") as string,
            latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
            longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined
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
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Register New Farmer</DialogTitle>
                    <DialogDescription>
                        Create a new farmer account manually. They will be auto-approved and must change their password on first login (default: welcome@123).
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
                        <div className="col-span-2 space-y-2">
                            <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input name="email" type="email" placeholder="suresh@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value)
                                    setSelectedDistrict("")
                                }}
                                required
                            >
                                <option value="">Select State</option>
                                {Object.keys(STATE_DISTRICTS).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>District / Region</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedState}
                                required
                            >
                                <option value="">Select District</option>
                                {selectedState && STATE_DISTRICTS[selectedState]?.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Land Size (e.g. 5 Acres)</Label>
                            <Input name="landSize" required placeholder="5 Acres" />
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Crops</Label>
                            <Input name="cropDetails" placeholder="Rice, Sugarcane" />
                        </div>
                        <div className="space-y-2 text-xs">
                            <Label className="text-sm">Latitude</Label>
                            <Input name="latitude" type="number" step="any" placeholder="12.9716" />
                        </div>
                        <div className="space-y-2 text-xs">
                            <Label className="text-sm">Longitude</Label>
                            <Input name="longitude" type="number" step="any" placeholder="77.5946" />
                        </div>
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
        if (!file) return toast.error("Please select a file first.");
        
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!validExtensions.includes(fileExt)) {
            toast.error("Please upload a .csv or .xlsx file.")
            return
        }

        setLoading(true)
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                if (!jsonData || jsonData.length < 2) {
                    toast.error("The file appears to be empty or invalid.")
                    setLoading(false)
                    return;
                }

                const res = await bulkImportFarmers(jsonData)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success(`Successfully imported ${res.count} farmers!`)
                    setOpen(false)
                    onRefresh()
                    setFile(null)
                }
                setLoading(false)
            };
            reader.onerror = () => {
                toast.error("Failed to read file");
                setLoading(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (e: any) {
            toast.error(e.message || "An error occurred during import")
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                    <Upload className="h-4 w-4" />
                    Import CSV / Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bulk Import Farmers</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file containing: <br />
                        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">name, phone, email, state, region, landSize, crops</code>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Button onClick={handleImport} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white" disabled={loading || !file}>
                        {loading ? "Processing Data..." : "Start Import"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function AdminEditFarmerModal({ farmer, onRefresh, open, setOpen }: any) {
    const [loading, setLoading] = useState(false)
    const [selectedState, setSelectedState] = useState(farmer.state || "")
    const [selectedDistrict, setSelectedDistrict] = useState(farmer.region || "")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const res = await updateFarmerAdmin(farmer.id, {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            state: selectedState,
            region: selectedDistrict || (formData.get("region") as string),
            landSize: formData.get("landSize") as string,
            cropDetails: formData.get("cropDetails") as string,
            latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
            longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined,
            isApproved: formData.get("isApproved") === "true",
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
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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
                            <Input name="phone" defaultValue={farmer.phone} required />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input name="email" defaultValue={farmer.email} type="email" />
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value)
                                    setSelectedDistrict("")
                                }}
                                required
                            >
                                <option value="">Select State</option>
                                {Object.keys(STATE_DISTRICTS).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>District / Region</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedState}
                                required
                            >
                                <option value="">Select District</option>
                                {selectedState && STATE_DISTRICTS[selectedState]?.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Land Size</Label>
                            <Input name="landSize" defaultValue={farmer.landSize} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Approval Status</Label>
                            <select name="isApproved" defaultValue={farmer.isApproved ? "true" : "false"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Primary Crops</Label>
                            <Input name="cropDetails" defaultValue={farmer.cropDetails} placeholder="Rice, Sugarcane" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Latitude</Label>
                            <Input name="latitude" type="number" step="any" defaultValue={farmer.latitude} placeholder="12.9716" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Longitude</Label>
                            <Input name="longitude" type="number" step="any" defaultValue={farmer.longitude} placeholder="77.5946" />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Farmer Profile: {farmer.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="col-span-2 pb-2 border-b">
                            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Contact Information</p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <p className="text-muted-foreground text-xs">Full Name</p>
                                    <p className="font-medium text-slate-900">{farmer.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Mobile</p>
                                    <p className="font-medium text-slate-900">{farmer.phone || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-muted-foreground text-xs">Email</p>
                                    <p className="font-medium text-slate-900">{farmer.email || "No email provided"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 pb-2 border-b">
                            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Farm Details</p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <p className="text-muted-foreground text-xs">State</p>
                                    <p className="font-medium text-slate-900">{farmer.state}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">District</p>
                                    <p className="font-medium text-slate-900">{farmer.region}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Land Size</p>
                                    <p className="font-medium text-slate-900">{farmer.landSize}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Main Crops</p>
                                    <p className="font-medium text-slate-900">{farmer.cropDetails}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 pb-2 border-b">
                            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Geolocation</p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <p className="text-muted-foreground text-xs">Latitude</p>
                                    <p className="font-medium text-slate-900">{farmer.latitude || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Longitude</p>
                                    <p className="font-medium text-slate-900">{farmer.longitude || "Not set"}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider pb-1">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farmer.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                                {farmer.isApproved ? 'APPROVED' : 'PENDING'}
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider pb-1">Pass Reset</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!farmer.mustChangePassword ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                                {farmer.mustChangePassword ? 'REQUIRED' : 'CHANGED'}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
