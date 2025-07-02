"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Building2, AlertTriangle } from "lucide-react"

// Mock data based on your SQL schema
const mockHospitals = [
  { hosp_ID: 1, hosp_name: "Springfield", city: "Asgard", manager: "Harsh Tanwar" },
  { hosp_ID: 2, hosp_name: "Hampshire", city: "Paradis", manager: "Dushyant" },
  { hosp_ID: 3, hosp_name: "Winterfell", city: "Marley", manager: "Dushyant" },
  { hosp_ID: 4, hosp_name: "Riverrun", city: "Wakanda", manager: "Nishtha" },
  { hosp_ID: 5, hosp_name: "Hogsmeade", city: "Sokovia", manager: "Dushyant" },
  { hosp_ID: 6, hosp_name: "Greenoaks", city: "Marley", manager: "Eminem" },
  { hosp_ID: 7, hosp_name: "Forestpark", city: "Marley", manager: "Pulkit" },
  { hosp_ID: 8, hosp_name: "Parkland", city: "Paradis", manager: "Eminem" },
  { hosp_ID: 9, hosp_name: "Pinecreek", city: "Valhalla", manager: "Luffy" },
  { hosp_ID: 10, hosp_name: "Alphaville", city: "Hogwarts", manager: "Walter White" },
]

const mockRequirements = [
  { hosp_ID: 1, hosp_name: "Springfield", hosp_needed_Bgrp: "A+", hosp_needed_qnty: 20 },
  { hosp_ID: 1, hosp_name: "Springfield", hosp_needed_Bgrp: "A-", hosp_needed_qnty: 0 },
  { hosp_ID: 1, hosp_name: "Springfield", hosp_needed_Bgrp: "AB+", hosp_needed_qnty: 40 },
  { hosp_ID: 1, hosp_name: "Springfield", hosp_needed_Bgrp: "AB-", hosp_needed_qnty: 10 },
  { hosp_ID: 1, hosp_name: "Springfield", hosp_needed_Bgrp: "B-", hosp_needed_qnty: 20 },
  { hosp_ID: 2, hosp_name: "Hampshire", hosp_needed_Bgrp: "A+", hosp_needed_qnty: 40 },
  { hosp_ID: 2, hosp_name: "Hampshire", hosp_needed_Bgrp: "AB+", hosp_needed_qnty: 20 },
  { hosp_ID: 2, hosp_name: "Hampshire", hosp_needed_Bgrp: "A-", hosp_needed_qnty: 10 },
  { hosp_ID: 2, hosp_name: "Hampshire", hosp_needed_Bgrp: "B-", hosp_needed_qnty: 30 },
  { hosp_ID: 2, hosp_name: "Hampshire", hosp_needed_Bgrp: "B+", hosp_needed_qnty: 0 },
  { hosp_ID: 2, hosp_name: "Hampshire", hosp_needed_Bgrp: "AB-", hosp_needed_qnty: 10 },
  { hosp_ID: 3, hosp_name: "Winterfell", hosp_needed_Bgrp: "B-", hosp_needed_qnty: 20 },
  { hosp_ID: 3, hosp_name: "Winterfell", hosp_needed_Bgrp: "B+", hosp_needed_qnty: 10 },
  { hosp_ID: 4, hosp_name: "Riverrun", hosp_needed_Bgrp: "A+", hosp_needed_qnty: 10 },
  { hosp_ID: 4, hosp_name: "Riverrun", hosp_needed_Bgrp: "A-", hosp_needed_qnty: 40 },
  { hosp_ID: 7, hosp_name: "Forestpark", hosp_needed_Bgrp: "B-", hosp_needed_qnty: 40 },
  { hosp_ID: 8, hosp_name: "Parkland", hosp_needed_Bgrp: "B+", hosp_needed_qnty: 10 },
  { hosp_ID: 9, hosp_name: "Pinecreek", hosp_needed_Bgrp: "AB-", hosp_needed_qnty: 20 },
]

const cities = [
  "Asgard",
  "Paradis",
  "Marley",
  "Wakanda",
  "Valhalla",
  "Madripoor",
  "Hogwarts",
  "Sokovia",
  "Kamar-Taj",
  "Gotham",
]
const managers = [
  "Harsh Tanwar",
  "Pulkit",
  "Dushyant",
  "Nishtha",
  "Walter White",
  "Eminem",
  "Elvis",
  "Shinchan",
  "Luffy",
  "Levi",
]
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState(mockHospitals)
  const [requirements, setRequirements] = useState(mockRequirements)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [newHospital, setNewHospital] = useState({
    hosp_name: "",
    city: "",
    manager: "",
  })
  const [newRequirement, setNewRequirement] = useState({
    hosp_ID: 0,
    hosp_needed_Bgrp: "",
    hosp_needed_qnty: 0,
  })

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.hosp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getHospitalRequirements = (hospId: number) => {
    return requirements.filter((req) => req.hosp_ID === hospId)
  }

  const getUrgentRequirements = () => {
    return requirements.filter((req) => req.hosp_needed_qnty > 30)
  }

  const handleAddHospital = () => {
    const newId = Math.max(...hospitals.map((h) => h.hosp_ID)) + 1
    const hospital = {
      ...newHospital,
      hosp_ID: newId,
    }
    setHospitals([...hospitals, hospital])
    setNewHospital({ hosp_name: "", city: "", manager: "" })
    setIsAddDialogOpen(false)
  }

  const handleAddRequirement = () => {
    const requirement = {
      ...newRequirement,
      hosp_name: hospitals.find((h) => h.hosp_ID === newRequirement.hosp_ID)?.hosp_name || "",
    }
    setRequirements([...requirements, requirement])
    setNewRequirement({ hosp_ID: 0, hosp_needed_Bgrp: "", hosp_needed_qnty: 0 })
    setIsRequirementDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Hospital Management
          </CardTitle>
          <CardDescription>Manage hospital information and blood requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hospitals" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="urgent">Urgent Needs</TabsTrigger>
            </TabsList>

            <TabsContent value="hospitals" className="space-y-4">
              {/* Search and Add Hospital */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search hospitals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hospital
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Hospital</DialogTitle>
                      <DialogDescription>Register a new partner hospital.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="hospital-name">Hospital Name</Label>
                        <Input
                          id="hospital-name"
                          value={newHospital.hosp_name}
                          onChange={(e) => setNewHospital({ ...newHospital, hosp_name: e.target.value })}
                          placeholder="Enter hospital name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="hospital-city">City</Label>
                        <Select
                          value={newHospital.city}
                          onValueChange={(value) => setNewHospital({ ...newHospital, city: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="hospital-manager">Manager</Label>
                        <Select
                          value={newHospital.manager}
                          onValueChange={(value) => setNewHospital({ ...newHospital, manager: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager} value={manager}>
                                {manager}
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
                      <Button onClick={handleAddHospital}>Add Hospital</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Hospitals Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Hospital Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHospitals.map((hospital) => {
                      const hospitalReqs = getHospitalRequirements(hospital.hosp_ID)
                      return (
                        <TableRow key={hospital.hosp_ID}>
                          <TableCell className="font-medium">{hospital.hosp_ID}</TableCell>
                          <TableCell>{hospital.hosp_name}</TableCell>
                          <TableCell>{hospital.city}</TableCell>
                          <TableCell>{hospital.manager}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{hospitalReqs.length} blood types needed</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedHospital(hospital)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setHospitals(hospitals.filter((h) => h.hosp_ID !== hospital.hosp_ID))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Blood Requirements by Hospital</h3>
                <Dialog open={isRequirementDialogOpen} onOpenChange={setIsRequirementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Requirement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Blood Requirement</DialogTitle>
                      <DialogDescription>Add a new blood requirement for a hospital.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="req-hospital">Hospital</Label>
                        <Select
                          value={newRequirement.hosp_ID.toString()}
                          onValueChange={(value) =>
                            setNewRequirement({ ...newRequirement, hosp_ID: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hospital" />
                          </SelectTrigger>
                          <SelectContent>
                            {hospitals.map((hospital) => (
                              <SelectItem key={hospital.hosp_ID} value={hospital.hosp_ID.toString()}>
                                {hospital.hosp_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="req-bloodgroup">Blood Group</Label>
                        <Select
                          value={newRequirement.hosp_needed_Bgrp}
                          onValueChange={(value) => setNewRequirement({ ...newRequirement, hosp_needed_Bgrp: value })}
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
                        <Label htmlFor="req-quantity">Quantity Needed</Label>
                        <Input
                          id="req-quantity"
                          type="number"
                          value={newRequirement.hosp_needed_qnty}
                          onChange={(e) =>
                            setNewRequirement({
                              ...newRequirement,
                              hosp_needed_qnty: Number.parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Enter quantity"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRequirementDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddRequirement}>Add Requirement</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Quantity Needed</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirements.map((req, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{req.hosp_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {req.hosp_needed_Bgrp}
                          </Badge>
                        </TableCell>
                        <TableCell>{req.hosp_needed_qnty} units</TableCell>
                        <TableCell>
                          {req.hosp_needed_qnty > 30 ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          ) : req.hosp_needed_qnty > 15 ? (
                            <Badge variant="secondary">Medium</Badge>
                          ) : req.hosp_needed_qnty > 0 ? (
                            <Badge variant="outline">Low</Badge>
                          ) : (
                            <Badge variant="secondary">Fulfilled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRequirements(requirements.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="urgent" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700">Urgent Blood Requirements</h3>
              </div>

              <div className="grid gap-4">
                {getUrgentRequirements().map((req, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{req.hosp_name}</h4>
                          <p className="text-gray-600">
                            Needs {req.hosp_needed_qnty} units of {req.hosp_needed_Bgrp}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-2">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            URGENT
                          </Badge>
                          <div className="space-x-2">
                            <Button size="sm">Contact Hospital</Button>
                            <Button size="sm" variant="outline">
                              Find Donors
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {getUrgentRequirements().length === 0 && (
                <div className="text-center py-8 text-gray-500">No urgent requirements at this time.</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
