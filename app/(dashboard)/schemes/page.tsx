"use client"

import { useState, useEffect } from "react"
import { FileText, Search, Calendar, IndianRupee, Users, ChevronRight, CheckCircle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const categories = ["All Categories", "Income Support", "Insurance", "Credit", "Technical", "Pension", "Marketing"]

import { getSchemes } from "../../actions"

export default function SchemesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null)
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

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || scheme.state === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Government Schemes
        </h1>
        <p className="text-muted-foreground">
          Explore agricultural schemes and subsidies available for farmers
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-chart-1/10 p-3">
              <FileText className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">15+</p>
              <p className="text-sm text-muted-foreground">Active Schemes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-chart-2/10 p-3">
              <IndianRupee className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">Rs. 2L+</p>
              <p className="text-sm text-muted-foreground">Potential Benefits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-chart-3/10 p-3">
              <Users className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">12 Cr+</p>
              <p className="text-sm text-muted-foreground">Beneficiaries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-chart-4/10 p-3">
              <Calendar className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">5</p>
              <p className="text-sm text-muted-foreground">New This Year</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schemes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading schemes...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className="transition-all hover:shadow-lg cursor-pointer"
              onClick={() => setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {scheme.state || "General"}
                      </Badge>
                      <Badge variant="outline" className="border-chart-1 text-chart-1">
                        Active
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{scheme.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {scheme.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${expandedScheme === scheme.id ? 'rotate-90' : ''}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 rounded-lg bg-chart-1/10 px-3 py-1.5">
                    <IndianRupee className="h-4 w-4 text-chart-1" />
                    <span className="text-sm font-semibold text-chart-1">{scheme.link || "Monetary Benefit"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {scheme.deadline ? new Date(scheme.deadline).toLocaleDateString() : "Open Deadline"}
                  </div>
                </div>

                {expandedScheme === scheme.id && (
                  <div className="mt-4 space-y-4 border-t border-border pt-4">
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-card-foreground">Eligibility Criteria:</h4>
                      <ul className="space-y-1">
                        {scheme.eligibility?.split('\n').map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-chart-1" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 gap-2">
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        Check Eligibility
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredSchemes.length === 0 && (
        <Card className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-card-foreground">No schemes found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
