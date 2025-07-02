"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Users,
  Heart,
  Building2,
  TestTube,
  UserCheck,
  Activity,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { useApi } from "@/hooks/use-api"
import DonorManagement from "@/components/donors/donor-management"
import HospitalManagement from "@/components/hospitals/hospital-management"

interface DashboardStats {
  totalDonors: number
  totalRecipients: number
  totalHospitals: number
  totalSpecimens: number
  bloodGroups: Record<string, { available: number; needed: number }>
  recentDonations: Array<{
    id: number
    name: string
    bloodGroup: string
    date: string
  }>
  urgentRequests: Array<{
    hospital: string
    bloodGroup: string
    quantity: number
  }>
}

export default function Dashboard() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  const { data: stats, loading, error, refetch } = useApi<DashboardStats>("/api/dashboard/stats")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6 flex items-center justify-center">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Heart className="h-10 w-10 text-red-500" />
            Blood Bank Management System
          </h1>
          <p className="text-gray-600">Comprehensive blood donation and distribution management</p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                  <Users className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDonors}</div>
                  <p className="text-xs text-muted-foreground">Active blood donors</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                  <UserCheck className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRecipients}</div>
                  <p className="text-xs text-muted-foreground">Blood recipients</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
                  <Building2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalHospitals}</div>
                  <p className="text-xs text-muted-foreground">Partner hospitals</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Specimens</CardTitle>
                  <TestTube className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSpecimens}</div>
                  <p className="text-xs text-muted-foreground">Available specimens</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Blood Group Inventory */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Blood Group Inventory
                  </CardTitle>
                  <CardDescription>Current availability vs demand</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(stats.bloodGroups).map(([group, data]) => (
                      <div
                        key={group}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedBloodGroup === group
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedBloodGroup(selectedBloodGroup === group ? null : group)}
                      >
                        <div className="text-center space-y-2">
                          <div className="text-lg font-bold text-red-600">{group}</div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Available</span>
                              <span className="font-medium">{data.available}</span>
                            </div>
                            <Progress value={(data.available / (data.available + data.needed)) * 100} className="h-2" />
                            <div className="flex justify-between text-xs">
                              <span>Needed</span>
                              <span className="font-medium text-orange-600">{data.needed}</span>
                            </div>
                          </div>
                          {data.needed > data.available && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="donations" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="donations">Donations</TabsTrigger>
                      <TabsTrigger value="requests">Requests</TabsTrigger>
                    </TabsList>

                    <TabsContent value="donations" className="space-y-4">
                      {stats.recentDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium">{donation.name}</div>
                            <div className="text-sm text-gray-600">ID: {donation.id}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{donation.bloodGroup}</Badge>
                            <div className="text-xs text-gray-500 mt-1">{donation.date}</div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-4">
                      {stats.urgentRequests.map((request, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <div className="font-medium">{request.hospital}</div>
                            <div className="text-sm text-gray-600">Hospital</div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive">{request.bloodGroup}</Badge>
                            <div className="text-xs text-gray-500 mt-1">{request.quantity} units</div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donors">
            <DonorManagement />
          </TabsContent>

          <TabsContent value="hospitals">
            <HospitalManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
