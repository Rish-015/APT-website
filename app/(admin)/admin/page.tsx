"use client"

import { useState, useEffect } from "react"
import {
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Search,
  MoreHorizontal,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Download,
  Plus,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"

import { getFarmers, getAdminStats, getSchemes, deleteScheme, deleteFarmer, toggleFarmerApproval, createStaffUser } from "../../actions"
import { toast } from "sonner"
import { AdminAddFarmerModal, AdminImportCSVModal, AdminEditFarmerModal, AdminViewFarmerModal } from "@/components/admin/farmer-modals"
import { AdminAddSchemeModal, AdminImportSchemesCSVModal } from "@/components/admin/scheme-modals"

const userGrowthData = [
  { month: "Jan", users: 8500 },
  { month: "Feb", users: 9200 },
  { month: "Mar", users: 9800 },
  { month: "Apr", users: 10500 },
  { month: "May", users: 11200 },
  { month: "Jun", users: 12450 },
]

const featureUsageData = [
  { feature: "Crop Rec", usage: 4500 },
  { feature: "Disease", usage: 3200 },
  { feature: "Weather", usage: 5800 },
  { feature: "Prices", usage: 4100 },
  { feature: "Forum", usage: 2900 },
]

const marketPricesAdmin = [
  { id: 1, crop: "Rice", market: "Chennai", price: 2150, lastUpdated: "2 hours ago" },
  { id: 2, crop: "Wheat", market: "Delhi", price: 2275, lastUpdated: "3 hours ago" },
  { id: 3, crop: "Cotton", market: "Mumbai", price: 6800, lastUpdated: "1 hour ago" },
  { id: 4, crop: "Sugarcane", market: "Coimbatore", price: 350, lastUpdated: "4 hours ago" },
]

export default function AdminPage() {
  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmersList, setFarmersList] = useState<any[]>([])
  const [schemes, setSchemes] = useState<any[]>([])
  const [stats, setStats] = useState({ totalFarmers: 0, totalSchemes: 0, marketUpdates: 0, dailyVisits: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Modal states for row actions
  const [editingFarmer, setEditingFarmer] = useState<any>(null)
  const [viewingFarmer, setViewingFarmer] = useState<any>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [fData, sData, stData] = await Promise.all([
        getFarmers().catch(e => { console.error("Farmers fetch failed", e); return [] }),
        getSchemes().catch(e => { console.error("Schemes fetch failed", e); return [] }),
        getAdminStats().catch(e => { console.error("Stats fetch failed", e); return { totalFarmers: 0, totalSchemes: 0, marketUpdates: 0, dailyVisits: 0 } })
      ])

      setFarmersList(fData || [])
      setSchemes(sData || [])
      setStats(stData || { totalFarmers: 0, totalSchemes: 0, marketUpdates: 0, dailyVisits: 0 })
    } catch (err) {
      console.error("Critical failure in loadData", err)
      toast.error("Some dashboard data failed to load.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
        const res = await toggleFarmerApproval(id, !currentStatus);
        if (res.error) throw new Error(res.error);
        toast.success(`Farmer ${!currentStatus ? 'approved' : 'unapproved'}`);
        setFarmersList(farmersList.map(f => f.id === id ? { ...f, isApproved: !currentStatus } : f));
    } catch (e: any) {
        toast.error(e.message);
    }
  }

  const handleDeleteScheme = async (id: string) => {
    try {
      if (confirm("Are you sure you want to delete this scheme?")) {
        const res = await deleteScheme(id);
        if (res.error) throw new Error(res.error);
        toast.success("Scheme deleted!");
        setSchemes(schemes.filter(s => s.id !== id));
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const handleDeleteFarmer = async (id: string) => {
    try {
      if (confirm("Are you sure you want to delete this farmer?")) {
        const res = await deleteFarmer(id);
        if (res.error) throw new Error(res.error);
        toast.success("Farmer deleted successfully!");
        setFarmersList(farmersList.filter(f => f.id !== id));
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const handleExportReport = () => {
    try {
      if (farmersList.length === 0) {
        toast.error("No data available to export.");
        return;
      }

      const headers = ["ID", "Name", "Email", "Phone", "State", "District", "Land Size", "Crops", "Latitude", "Longitude", "Approval", "Pass Reset", "Join Date"];
      const rows = farmersList.map(f => [
        f.id,
        `"${f.name}"`,
        `"${f.email || 'N/A'}"`,
        `"${f.phone || 'N/A'}"`,
        `"${f.state || 'N/A'}"`,
        `"${f.region || 'N/A'}"`,
        `"${f.landSize || 'N/A'}"`,
        `"${f.cropDetails || 'N/A'}"`,
        f.latitude || 'N/A',
        f.longitude || 'N/A',
        f.isApproved ? "Approved" : "Pending",
        f.mustChangePassword ? "Required" : "Done",
        "Recently" 
      ]);

      const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `agro_farmers_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Failed to generate report.");
    }
  }

  const filteredFarmers = (farmersList || []).filter(farmer => {
    const searchTerm = (farmerSearch || "").toLowerCase()
    const nameMatch = (farmer.name || "").toLowerCase().includes(searchTerm)
    const emailMatch = (farmer.email || "").toLowerCase().includes(searchTerm)
    return nameMatch || emailMatch
  })

  const dynamicAdminStats = [
    { title: "Total Farmers", value: stats.totalFarmers.toLocaleString(), change: "+New", icon: Users, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    { title: "Active Schemes", value: stats.totalSchemes, change: "+New", icon: FileText, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    { title: "Market Updates", value: "324", change: "+45", icon: TrendingUp, color: "text-chart-3", bgColor: "bg-chart-3/10" },
    { title: "Daily Visits", value: "8,920", change: "+18%", icon: BarChart3, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Admin Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage farmers, schemes, and platform analytics
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportReport}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button className="gap-2" onClick={() => {
                const name = prompt("Enter Name:");
                const email = prompt("Enter Email:");
                const role = prompt("Enter Role (USER, OFFICER, ADMIN):") as any;
                if (name && email && role) {
                    createStaffUser({ name, email, role }).then(res => {
                        if (res.error) toast.error(res.error);
                        else {
                            toast.success("User created and email sent!");
                            loadData();
                        }
                    });
                }
            }}>
                <UserPlus className="h-4 w-4" />
                Add Staff
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicAdminStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {isLoading ? "..." : stat.value}
              </div>
              <p className="text-xs text-chart-1 mt-1">{stat.change} this month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly registered farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-slate-500" />
                  <YAxis tick={{ fontSize: 12 }} className="text-slate-500" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--chart-1)' }}
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>Monthly active users by feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="feature" tick={{ fontSize: 12 }} className="text-slate-500" />
                  <YAxis tick={{ fontSize: 12 }} className="text-slate-500" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Bar
                    dataKey="usage"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    name="Usage"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="farmers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="farmers" className="gap-2">
            <Users className="h-4 w-4" />
            Farmers
          </TabsTrigger>
          <TabsTrigger value="schemes" className="gap-2">
            <FileText className="h-4 w-4" />
            Schemes
          </TabsTrigger>
          <TabsTrigger value="prices" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Market Prices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="farmers">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Manage Farmers</CardTitle>
                  <CardDescription>View and manage registered farmers</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search farmers..."
                      value={farmerSearch}
                      onChange={(e) => setFarmerSearch(e.target.value)}
                      className="w-64 pl-10"
                    />
                  </div>
                  <AdminImportCSVModal onRefresh={loadData} />
                  <AdminAddFarmerModal onRefresh={loadData} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table className="w-full table-fixed border-collapse">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Name</TableHead>
                      <TableHead className="w-[15%]">Location</TableHead>
                      <TableHead className="w-[20%]">Crops</TableHead>
                      <TableHead className="w-[15%]">Approval</TableHead>
                      <TableHead className="w-[15%]">Pass Change</TableHead>
                      <TableHead className="w-[15%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                      </TableRow>
                    ) : filteredFarmers.length > 0 ? (
                      filteredFarmers.map((farmer) => (
                        <TableRow key={farmer.id}>
                          <TableCell className="truncate">
                            <p className="font-medium truncate">{farmer.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{farmer.email}</p>
                          </TableCell>
                          <TableCell className="truncate">
                            <div className="flex flex-col">
                              <span>{farmer.state || 'N/A'}</span>
                              <span className="text-[10px] text-muted-foreground">{farmer.region || ''}</span>
                            </div>
                          </TableCell>
                          <TableCell className="truncate">{farmer.cropDetails || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                <Badge variant={farmer.isApproved ? 'default' : 'secondary'}>
                                    {farmer.isApproved ? 'Approved' : 'Pending'}
                                </Badge>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 px-2 text-[10px]"
                                    onClick={() => handleToggleApproval(farmer.id, farmer.isApproved)}
                                >
                                    {farmer.isApproved ? <XCircle className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                                    {farmer.isApproved ? 'Revoke' : 'Approve'}
                                </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                             {farmer.mustChangePassword ? (
                                <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">Required</Badge>
                             ) : (
                                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Done</Badge>
                             )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setViewingFarmer(farmer)}>
                                  <Eye className="h-4 w-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setEditingFarmer(farmer)}>
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={() => handleDeleteFarmer(farmer.id)}>
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} className="text-center py-6">No records found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemes">
            {/* ... (Existing Schemes Table - restored manually since I saw it earlier) */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Schemes</CardTitle>
                        <div className="flex gap-2">
                            <AdminImportSchemesCSVModal onRefresh={loadData} />
                            <AdminAddSchemeModal onRefresh={loadData} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schemes.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">{s.title}</TableCell>
                                    <TableCell>{s.category}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteScheme(s.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Manage Market Prices</CardTitle>
                  <CardDescription>Update crop prices from various markets</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Price Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Crop</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {marketPricesAdmin.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell className="font-medium">{price.crop}</TableCell>
                        <TableCell>{price.market}</TableCell>
                        <TableCell className="font-semibold">{price.price.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingFarmer && (
        <AdminEditFarmerModal
          farmer={editingFarmer}
          open={!!editingFarmer}
          setOpen={(val: boolean) => !val && setEditingFarmer(null)}
          onRefresh={loadData}
        />
      )}
      {viewingFarmer && (
        <AdminViewFarmerModal
          farmer={viewingFarmer}
          open={!!viewingFarmer}
          setOpen={(val: boolean) => !val && setViewingFarmer(null)}
        />
      )}
    </div>
  )
}
