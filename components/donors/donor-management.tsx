"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, User, RefreshCw } from "lucide-react"
import { useApi, apiCall } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

interface Donor {
  bd_ID: number
  bd_name: string
  bd_age: string
  bd_sex: string
  bd_Bgroup: string
  bd_reg_date: string
  reco_ID: number
  City_ID: number
  City_name: string
  staff_name: string
}

interface City {
  City_ID: number
  City_name: string
}

interface Staff {
  reco_ID: number
  reco_Name: string
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function DonorManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBloodGroup, setFilterBloodGroup] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null)
  const [newDonor, setNewDonor] = useState({
    bd_name: "",
    bd_age: "",
    bd_sex: "",
    bd_Bgroup: "",
    City_ID: "",
    reco_ID: "",
  })

  const { toast } = useToast()

  // Build query parameters
  const queryParams = new URLSearchParams()
  if (searchTerm) queryParams.set("search", searchTerm)
  if (filterBloodGroup !== "all") queryParams.set("bloodGroup", filterBloodGroup)

  const { data: donors, loading, error, refetch } = useApi<Donor[]>(`/api/donors?${queryParams.toString()}`)
  const { data: cities } = useApi<City[]>("/api/cities")
  const { data: staff } = useApi<Staff[]>("/api/staff?type=recording")

  const handleAddDonor = async () => {
    const result = await apiCall("/api/donors", {
      method: "POST",
      body: JSON.stringify({
        ...newDonor,
        City_ID: Number.parseInt(newDonor.City_ID),
        reco_ID: Number.parseInt(newDonor.reco_ID),
      }),
    })

    if (result.success) {
      toast({
        title: "Success",
        description: "Donor added successfully",
      })
      setNewDonor({ bd_name: "", bd_age: "", bd_sex: "", bd_Bgroup: "", City_ID: "", reco_ID: "" })
      setIsAddDialogOpen(false)
      refetch()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add donor",
        variant: "destructive",
      })
    }
  }

  const handleEditDonor = (donor: Donor) => {
    setEditingDonor(donor)
    setNewDonor({
      bd_name: donor.bd_name,
      bd_age: donor.bd_age,
      bd_sex: donor.bd_sex,
      bd_Bgroup: donor.bd_Bgroup,
      City_ID: donor.City_ID.toString(),
      reco_ID: donor.reco_ID.toString(),
    })
  }

  const handleUpdateDonor = async () => {
    if (!editingDonor) return

    const result = await apiCall(`/api/donors/${editingDonor.bd_ID}`, {
      method: "PUT",
      body: JSON.stringify({
        ...newDonor,
        City_ID: Number.parseInt(newDonor.City_ID),
        reco_ID: Number.parseInt(newDonor.reco_ID),
      }),
    })

    if (result.success) {
      toast({
        title: "Success",
        description: "Donor updated successfully",
      })
      setEditingDonor(null)
      setNewDonor({ bd_name: "", bd_age: "", bd_sex: "", bd_Bgroup: "", City_ID: "", reco_ID: "" })
      refetch()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update donor",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDonor = async (id: number) => {
    const result = await apiCall(`/api/donors/${id}`, {
      method: "DELETE",
    })

    if (result.success) {
      toast({
        title: "Success",
        description: "Donor deleted successfully",
      })
      refetch()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete donor",
        variant: "destructive",
      })
    }
  }

  // Trigger refetch when search or filter changes
  useEffect(() => {
    refetch()
  }, [searchTerm, filterBloodGroup])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Blood Donor Management
          </CardTitle>
          <CardDescription>Manage blood donor information and registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Groups</SelectItem>
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Donor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Donor</DialogTitle>
                  <DialogDescription>Enter donor information to register a new blood donor.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newDonor.bd_name}
                      onChange={(e) => setNewDonor({ ...newDonor, bd_name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={newDonor.bd_age}
                        onChange={(e) => setNewDonor({ ...newDonor, bd_age: e.target.value })}
                        placeholder="Age"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sex">Gender</Label>
                      <Select
                        value={newDonor.bd_sex}
                        onValueChange={(value) => setNewDonor({ ...newDonor, bd_sex: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bloodgroup">Blood Group</Label>
                    <Select
                      value={newDonor.bd_Bgroup}
                      onValueChange={(value) => setNewDonor({ ...newDonor, bd_Bgroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Select
                      value={newDonor.City_ID}
                      onValueChange={(value) => setNewDonor({ ...newDonor, City_ID: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.map((city) => (
                          <SelectItem key={city.City_ID} value={city.City_ID.toString()}>
                            {city.City_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="staff">Recording Staff</Label>
                    <Select
                      value={newDonor.reco_ID}
                      onValueChange={(value) => setNewDonor({ ...newDonor, reco_ID: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff?.map((member) => (
                          <SelectItem key={member.reco_ID} value={member.reco_ID.toString()}>
                            {member.reco_Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDonor}>Add Donor</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Donors Table */}
          {error ? (
            <div className="text-center py-8 text-red-500">Error loading donors: {error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors?.map((donor) => (
                    <TableRow key={donor.bd_ID}>
                      <TableCell className="font-medium">{donor.bd_ID}</TableCell>
                      <TableCell>{donor.bd_name}</TableCell>
                      <TableCell>{donor.bd_age}</TableCell>
                      <TableCell>{donor.bd_sex}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {donor.bd_Bgroup}
                        </Badge>
                      </TableCell>
                      <TableCell>{donor.bd_reg_date}</TableCell>
                      <TableCell>{donor.City_name}</TableCell>
                      <TableCell>{donor.staff_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDonor(donor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteDonor(donor.bd_ID)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {donors?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No donors found matching your criteria.</div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingDonor} onOpenChange={() => setEditingDonor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
            <DialogDescription>Update donor information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={newDonor.bd_name}
                onChange={(e) => setNewDonor({ ...newDonor, bd_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  value={newDonor.bd_age}
                  onChange={(e) => setNewDonor({ ...newDonor, bd_age: e.target.value })}
                  placeholder="Age"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-sex">Gender</Label>
                <Select value={newDonor.bd_sex} onValueChange={(value) => setNewDonor({ ...newDonor, bd_sex: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bloodgroup">Blood Group</Label>
              <Select
                value={newDonor.bd_Bgroup}
                onValueChange={(value) => setNewDonor({ ...newDonor, bd_Bgroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-city">City</Label>
              <Select value={newDonor.City_ID} onValueChange={(value) => setNewDonor({ ...newDonor, City_ID: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city.City_ID} value={city.City_ID.toString()}>
                      {city.City_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-staff">Recording Staff</Label>
              <Select value={newDonor.reco_ID} onValueChange={(value) => setNewDonor({ ...newDonor, reco_ID: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff?.map((member) => (
                    <SelectItem key={member.reco_ID} value={member.reco_ID.toString()}>
                      {member.reco_Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDonor(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDonor}>Update Donor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
