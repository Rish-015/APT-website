"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Leaf, Globe, ChevronDown } from "lucide-react"

import Image from "next/image"

const languages = [
  { code: "en", name: "English" },
  { code: "ta", name: "தமிழ்" },
  { code: "hi", name: "हिंदी" },
]

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState("en")

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    const host = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${host};`;
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-border">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Agro Puthalvan Logo"
            width={60}
            height={60}
            unoptimized
            className="object-contain"
          />
          <div className="flex flex-col notranslate">
            <span className="text-xl font-black uppercase tracking-wider leading-none">
              <span className="text-[#1390d4]">Agro </span>
              <span className="text-[#00c563]">Puthalvan</span>
            </span>
            <span className="text-[0.65rem] font-bold text-[#fbad2a] uppercase tracking-[0.2em] mt-0.5">
              Technologies
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-primary font-semibold hover:text-primary/80 transition-colors">
            Home
          </Link>
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/weather" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Weather
          </Link>
          <Link href="/market-prices" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Market Prices
          </Link>
          <Link href="/schemes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Schemes
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                {languages.find(l => l.code === language)?.name}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Link href="/" className="text-sm font-medium text-primary">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/weather" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Weather
            </Link>
            <Link href="/market-prices" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Market Prices
            </Link>
            <Link href="/schemes" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Schemes
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
