"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
    ShieldCheck,
    Users,
    FileText,
    TrendingUp,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    X,
    Gauge
} from "lucide-react"

const adminItems = [
    {
        title: "Overview",
        href: "/admin",
        icon: Gauge,
    },
    {
        title: "Manage Farmers",
        href: "/admin#farmers",
        icon: Users,
    },
    {
        title: "Govt Schemes",
        href: "/admin#schemes",
        icon: FileText,
    },
    {
        title: "Market Prices",
        href: "/admin#prices",
        icon: TrendingUp,
    },
    {
        title: "System Settings",
        href: "/admin#settings",
        icon: Settings,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Use a strictly distinct dark theme for the Admin Panel
    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-slate-100 lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle admin sidebar"
            >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 shadow-xl shadow-slate-900/20",
                    collapsed ? "w-20" : "w-64",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Area */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4 bg-slate-950">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white rounded-md p-1">
                            <Image
                                src="/logo.png"
                                alt="Agro Puthalvan Logo"
                                width={32}
                                height={32}
                                unoptimized
                                className="object-contain"
                            />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col overflow-hidden notranslate ml-1">
                                <span className="text-sm font-black uppercase tracking-widest text-slate-100">
                                    Agro Admin
                                </span>
                                <span className="text-[0.60rem] font-bold text-[#fbad2a] uppercase tracking-widest mt-0.5">
                                    Secure Portal
                                </span>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden rounded-lg p-1 hover:bg-slate-800 text-slate-400 lg:block"
                        aria-label="Toggle sidebar"
                    >
                        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 py-6">
                    <div className={cn("mb-2 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase", collapsed && "hidden")}>
                        Menu
                    </div>
                    <ul className="space-y-1.5">
                        {adminItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                                                : "hover:bg-slate-800 hover:text-slate-100"
                                        )}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                                        {!collapsed && <span>{item.title}</span>}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Bottom Actions */}
                <div className="border-t border-slate-800 p-4 bg-slate-950/50">
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100",
                            collapsed && "justify-center px-0"
                        )}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>Exit to App</span>}
                    </Link>
                </div>
            </aside>
        </>
    )
}
