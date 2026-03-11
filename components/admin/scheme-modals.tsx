"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createScheme, bulkImportSchemes } from "@/app/actions"
import { Download, Upload } from "lucide-react"

export function AdminImportSchemesCSVModal({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        try {
            const text = await file.text()
            const res = await bulkImportSchemes(text)
            if (res.error) throw new Error(res.error)
            
            toast.success(`Successfully imported ${res.count} schemes!`)
            setOpen(false)
            onRefresh()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const downloadTemplate = () => {
        const headers = "scheme,slug,details,benefits,eligibility,application_process,documents_required,level,scheme_category,tags";
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "agro_schemes_template.csv";
        a.click();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                    <Upload className="h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Import Schemes</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file containing schemes data. Ensure headers match the template.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex justify-between items-center text-sm">
                        <span>Download the correct CSV structure:</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={downloadTemplate}>
                            <Download className="h-3 w-3" /> Get Template
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Label>Select CSV File</Label>
                        <Input type="file" accept=".csv" onChange={handleFileChange} />
                    </div>
                    <Button 
                        className="w-full bg-emerald-700 hover:bg-emerald-800" 
                        disabled={!file || loading}
                        onClick={handleUpload}
                    >
                        {loading ? "Importing Data..." : "Upload & Import"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function AdminAddSchemeModal({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const res = await createScheme({
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            benefits: formData.get("benefits") as string,
            eligibility: formData.get("eligibility") as string,
            applicationProcess: formData.get("applicationProcess") as string,
            documentsRequired: formData.get("documentsRequired") as string,
            level: formData.get("level") as string,
            category: formData.get("category") as string,
            tags: formData.get("tags") as string,
        })

        setLoading(false)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Government Scheme published globally!")
            setOpen(false)
            onRefresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Plus className="h-4 w-4" />
                    Publish Scheme
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Publish New Scheme</DialogTitle>
                    <DialogDescription>
                        Release a new agricultural scheme globally to all farmers on Agro Puthalvan.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                        <Label>Scheme Title</Label>
                        <Input name="name" required placeholder="PM-KISAN Update 2026" />
                    </div>
                    <div className="space-y-2">
                        <Label>Scheme Slug (optional)</Label>
                        <Input name="slug" placeholder="pm-kisan-2026" />
                    </div>
                    <div className="space-y-2">
                        <Label>Full Description</Label>
                        <Input name="description" required placeholder="Detailed information about the scheme..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input name="category" required placeholder="Welfare" />
                        </div>
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Input name="level" required placeholder="Central" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Eligibility Criteria</Label>
                        <Input name="eligibility" placeholder="Small and marginal farmers..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Benefits</Label>
                        <Input name="benefits" placeholder="Financial assistance of Rs. 6000..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Application Process</Label>
                        <Input name="applicationProcess" placeholder="Apply online via PM-Kisan portal..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Documents Required</Label>
                        <Input name="documentsRequired" placeholder="Aadhaar, Land records..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Tags (Comma separated)</Label>
                        <Input name="tags" placeholder="Farmers, Financial, Central" />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                        {loading ? "Publishing..." : "Publish Scheme"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

