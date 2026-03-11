"use client"

import { useState, useEffect } from "react"
import { FileText, Search, IndianRupee, MapPin, Layers, Info, CheckCircle2, ClipboardList, BookOpen, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getSchemes } from "../../actions"

export default function SchemesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedScheme, setSelectedScheme] = useState<any>(null)
  const [schemes, setSchemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSchemes() {
      try {
        const data = await getSchemes();
        setSchemes(data);
      } catch (e) {
        console.error("Failed to fetch schemes", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchemes();
  }, [])

  const filteredSchemes = (schemes || []).filter(scheme => 
    (scheme.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (scheme.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-3 py-1 text-sm font-medium">
            Government Schemes 2026
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Agricultural Empowerment
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Access financial aid, insurance, and technical support provided by the government to boost your farming productivity.
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white shadow-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-2xl text-base"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-slate-100 rounded-3xl cursor-pointer flex flex-col"
              onClick={() => setSelectedScheme(scheme)}
            >
              <div className="absolute top-0 right-0 p-4">
                <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-slate-200 text-slate-600 font-medium px-3 py-1 rounded-full flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                  <Layers className="h-3 w-3" />
                  {scheme.level || "Central"}
                </Badge>
              </div>
              <CardHeader className="pt-10 pb-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IndianRupee className="h-7 w-7 text-emerald-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {scheme.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Eligibility</p>
                      <p className="text-sm font-medium text-slate-700 line-clamp-2">{scheme.eligibility}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <IndianRupee className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Key Benefit</p>
                      <p className="text-sm font-medium text-slate-700 line-clamp-2">{scheme.benefits}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button variant="ghost" className="w-full justify-between items-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold group/btn">
                  Explore Full Details
                  <Info className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Full Detail Sheet */}
      <Sheet open={!!selectedScheme} onOpenChange={() => setSelectedScheme(null)}>
        <SheetContent className="w-full sm:max-w-2xl bg-white p-0 overflow-y-auto border-l-0 shadow-2xl">
          {selectedScheme && (
            <div className="relative">
              {/* Header Visual */}
              <div className="h-32 bg-gradient-to-br from-emerald-600 to-emerald-800" />
              <div className="px-8 -mt-12">
                <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6">
                  <IndianRupee className="h-10 w-10 text-emerald-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-100 text-emerald-800 border-none px-3 py-1 rounded-full uppercase text-[10px] tracking-widest font-bold">
                      {selectedScheme.category}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                       <MapPin className="h-3 w-3" />
                       {selectedScheme.level} Level
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                    {selectedScheme.title}
                  </h2>
                </div>

                <div className="mt-10 space-y-12 pb-20">
                  {/* Summary Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">About the Scheme</h3>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl text-slate-700 leading-relaxed">
                      {selectedScheme.description}
                    </div>
                  </section>

                  {/* High Impact Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm">
                       <ClipboardList className="h-6 w-6 text-emerald-600 mb-3" />
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Benefit Package</h4>
                       <p className="text-slate-900 font-semibold">{selectedScheme.benefits}</p>
                    </div>
                    <div className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm">
                       <CheckCircle2 className="h-6 w-6 text-blue-600 mb-3" />
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Eligibility Status</h4>
                       <p className="text-slate-900 font-semibold">{selectedScheme.eligibility}</p>
                    </div>
                  </div>

                  {/* Application Process */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Application & Documents</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="relative pl-8 border-l-2 border-emerald-100 pb-2">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
                        <h4 className="font-bold text-slate-900 mb-1">Process Steps</h4>
                        <p className="text-slate-600 leading-relaxed text-sm">{selectedScheme.applicationProcess}</p>
                      </div>
                      <div className="relative pl-8 border-l-2 border-emerald-100">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                        <h4 className="font-bold text-slate-900 mb-1">Documents Required</h4>
                        <p className="text-slate-600 leading-relaxed text-sm">{selectedScheme.documentsRequired}</p>
                      </div>
                    </div>
                  </section>
                  
                  <div className="pt-6">
                    <Button className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200">
                      Apply through Official Portal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {filteredSchemes.length === 0 && !isLoading && (
        <Card className="flex flex-col items-center justify-center py-20 bg-slate-50 border-dashed border-2 border-slate-200 rounded-[3rem]">
          <div className="bg-white p-6 rounded-full shadow-lg mb-6">
            <FileText className="h-14 w-14 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No matching schemes</h3>
          <p className="mt-2 text-slate-500 text-center max-w-sm">
            Try searching for common terms like "Income", "Fertilizer", or check your spelling.
          </p>
          <Button variant="link" onClick={() => setSearchQuery("")} className="mt-4 text-emerald-600 font-bold">
            Clear all filters
          </Button>
        </Card>
      )}
    </div>
  )
}
