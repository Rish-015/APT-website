"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

export function Footer() {
  const { data: session } = useSession()
  const isLoggedIn = !!session

  // Helper for auth-guarded links
  const getLink = (path: string) => isLoggedIn ? path : "/login"

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Agro Puthalvan Logo"
                width={60}
                height={60}
                unoptimized
                className="object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black uppercase tracking-wider leading-none">
                  <span className="text-[#1390d4]">Agro </span>
                  <span className="text-[#00c563]">Puthalvan</span>
                </span>
                <span className="text-[0.65rem] font-bold text-[#fbad2a] uppercase tracking-[0.2em] mt-0.5">
                  Technologies
                </span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering farmers with AI-powered smart farming solutions for a sustainable future.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-card-foreground">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={getLink("/dashboard")} className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
              <li><Link href={getLink("/crop-suggestion")} className="text-muted-foreground hover:text-foreground">Crop Recommendation</Link></li>
              <li><Link href={getLink("/disease-detection")} className="text-muted-foreground hover:text-foreground">Disease Detection</Link></li>
              <li><Link href="/weather" className="text-muted-foreground hover:text-foreground">Weather</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-card-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/schemes" className="text-muted-foreground hover:text-foreground">Government Schemes</Link></li>
              <li><Link href="/market-prices" className="text-muted-foreground hover:text-foreground">Market Prices</Link></li>
              <li><Link href={getLink("/community")} className="text-muted-foreground hover:text-foreground">Community Forum</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-card-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} <span className="notranslate">Agro Puthalvan Technologies</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
