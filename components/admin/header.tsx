"use client"

import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export function AdminHeader() {
    const { data: session } = useSession()

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
            <div className="flex flex-1 items-center gap-4 md:gap-8">
                <form className="hidden flex-1 sm:block max-w-md">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search administration..."
                            className="w-full bg-slate-50 border-slate-200 pl-9 focus-visible:ring-emerald-500 rounded-full h-9"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-3">
                {/* Administrator Badge */}
                <div className="hidden md:flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 font-medium text-xs">
                    Super Admin
                </div>

                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 ml-1 border border-slate-200 hover:bg-slate-200 h-9 w-9">
                            <User className="h-4 w-4 text-slate-600" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session?.user?.name || "Administrator"}</p>
                                <p className="text-xs leading-none text-slate-500">
                                    {session?.user?.email || "admin@agroputhalvan.com"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer">Profile Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="cursor-pointer">Switch to Farmer View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
