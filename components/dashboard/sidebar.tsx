"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import {
  Leaf,
  LayoutDashboard,
  Sprout,
  Bug,
  TestTube,
  CloudSun,
  TrendingUp,
  FileText,
  Users,
  ChevronLeft,
  ShieldCheck,
  Menu,
  X
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Crop Suggestion",
    href: "/crop-suggestion",
    icon: Sprout,
  },
  {
    title: "Disease Detection",
    href: "/disease-detection",
    icon: Bug,
  },
  {
    title: "Fertilizer",
    href: "/fertilizer",
    icon: TestTube,
  },
  {
    title: "Weather",
    href: "/weather",
    icon: CloudSun,
  },
  {
    title: "Market Prices",
    href: "/market-prices",
    icon: TrendingUp,
  },
  {
    title: "Schemes",
    href: "/schemes",
    icon: FileText,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
]

const adminItems = [
  {
    title: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <Image
                src="/logo.png"
                alt="Agro Puthalvan Logo"
                width={40}
                height={40}
                unoptimized
                className="object-contain"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden notranslate">
                <span className="text-lg font-black uppercase tracking-wider leading-none whitespace-nowrap">
                  <span className="text-[#1390d4]">Agro </span>
                  <span className="text-[#00c563]">Puthalvan</span>
                </span>
                <span className="text-[0.6rem] font-bold text-[#fbad2a] uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">
                  Technologies
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 hover:bg-sidebar-accent lg:block"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>

          {(session?.user as any)?.role === "ADMIN" && (
            <>
              <div className="my-4 border-t border-sidebar-border" />

              <ul className="space-y-1">
                {adminItems.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex flex-col gap-1 text-center text-xs text-muted-foreground notranslate">
            {collapsed ? "AP" : "Agro Puthalvan © 2026"}
          </div>
        </div>
      </aside>
    </>
  )
}
