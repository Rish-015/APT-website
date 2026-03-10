"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createScheme } from "@/app/actions"

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
            benefit: formData.get("benefit") as string,
            deadline: formData.get("deadline") as string,
            eligibility: formData.get("eligibility") as string,
            category: formData.get("category") as string,
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
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Scheme Title</Label>
                        <Input name="name" required placeholder="PM-KISAN Update 2026" />
                    </div>
                    <div className="space-y-2">
                        <Label>Summary Description</Label>
                        <Input name="description" required placeholder="Provides financial support to landholding farmers." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Department / State</Label>
                            <Input name="category" required placeholder="Central Govt" />
                        </div>
                        <div className="space-y-2">
                            <Label>Registration Deadline</Label>
                            <Input type="date" name="deadline" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Eligibility Target</Label>
                        <Input name="eligibility" placeholder="All small/marginal farmers" />
                    </div>
                    <div className="space-y-2">
                        <Label>Fund / Benefit Value</Label>
                        <Input name="benefit" placeholder="Rs. 6000 per year" />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                        {loading ? "Publishing..." : "Publish Scheme"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
