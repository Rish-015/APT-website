import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Smartphone } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] lg:p-16">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
            <Smartphone className="h-10 w-10 text-white" />
          </div>

          <h2 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to Transform Your Farm?
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/90">
            Join thousands of modern farmers who are already using <span className="notranslate">Agro Puthalvan</span> to increase
            their yields, reduce costs, and make smarter agricultural decisions backed by data.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8 h-12 text-base rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm border border-secondary/20">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base rounded-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                Contact Sales
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/70">
            Free to start. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
