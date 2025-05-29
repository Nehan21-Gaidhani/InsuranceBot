"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Bell, CalendarIcon, CheckCircle2, FileText, MessageSquare, Phone } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Policy = {
  id: string
  name: string
  provider: string
  type: string
  renewalDate: string
  premium: number
  status: "active" | "pending" | "expired"
}

type Reminder = {
  id: string
  title: string
  date: Date
  type: "renewal" | "payment" | "claim" | "other"
  completed: boolean
}

type ClaimStatus = {
  id: string
  policyName: string
  claimDate: string
  amount: number
  status: "submitted" | "in-review" | "approved" | "denied"
  lastUpdated: string
}

export function PostSaleAssistant() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("policies")

  // Sample data
  const policies: Policy[] = [
    {
      id: "1",
      name: "Premium Health Plus",
      provider: "BlueCross Insurance",
      type: "Health",
      renewalDate: "2023-12-15",
      premium: 450,
      status: "active",
    },
    {
      id: "2",
      name: "Full Coverage Auto",
      provider: "DriveSecure",
      type: "Auto",
      renewalDate: "2023-09-30",
      premium: 180,
      status: "active",
    },
    {
      id: "3",
      name: "Term Life 30",
      provider: "LifeSecure",
      type: "Life",
      renewalDate: "2024-05-22",
      premium: 85,
      status: "active",
    },
  ]

  const reminders: Reminder[] = [
    {
      id: "r1",
      title: "Auto Insurance Renewal",
      date: new Date("2023-09-30"),
      type: "renewal",
      completed: false,
    },
    {
      id: "r2",
      title: "Health Insurance Premium Payment",
      date: new Date("2023-08-15"),
      type: "payment",
      completed: true,
    },
    {
      id: "r3",
      title: "Submit Medical Claim Documents",
      date: new Date("2023-08-05"),
      type: "claim",
      completed: false,
    },
  ]

  const claims: ClaimStatus[] = [
    {
      id: "c1",
      policyName: "Premium Health Plus",
      claimDate: "2023-07-12",
      amount: 1250,
      status: "approved",
      lastUpdated: "2023-07-25",
    },
    {
      id: "c2",
      policyName: "Full Coverage Auto",
      claimDate: "2023-06-30",
      amount: 3500,
      status: "in-review",
      lastUpdated: "2023-07-15",
    },
  ]

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Submitted</Badge>
      case "in-review":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">In Review</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "denied":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Denied</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to toggle reminder completion
  const toggleReminderCompletion = (id: string) => {
    // In a real app, this would update state or call an API
    console.log(`Toggling reminder ${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Post-Sale Engagement Assistant</h2>
        <p className="text-muted-foreground">Manage your policies, claims, and get timely reminders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{policy.name}</CardTitle>
                    {getStatusBadge(policy.status)}
                  </div>
                  <CardDescription>{policy.provider}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{policy.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Premium:</span>
                      <span>${policy.premium}/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Renewal Date:</span>
                      <span>{new Date(policy.renewalDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">Manage</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Need Assistance?</CardTitle>
              <CardDescription>Contact your insurance provider or get help from our AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Call Provider</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat Support</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>File a Claim</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-medium">Upcoming Reminders</h3>

              {reminders.length > 0 ? (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        reminder.completed ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            reminder.type === "renewal"
                              ? "bg-blue-100"
                              : reminder.type === "payment"
                                ? "bg-green-100"
                                : reminder.type === "claim"
                                  ? "bg-yellow-100"
                                  : "bg-gray-100"
                          }`}
                        >
                          {reminder.type === "renewal" ? (
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                          ) : reminder.type === "payment" ? (
                            <Bell className="h-4 w-4 text-green-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <div
                            className={`font-medium ${reminder.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {reminder.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reminder.date.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleReminderCompletion(reminder.id)}
                      >
                        <CheckCircle2
                          className={`h-5 w-5 ${
                            reminder.completed ? "text-green-500 fill-green-500" : "text-muted-foreground"
                          }`}
                        />
                        <span className="sr-only">Toggle completion</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No reminders</h3>
                  <p className="mt-2 text-muted-foreground">You don't have any upcoming reminders</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Add New Reminder</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-title">Title</Label>
                    <Input id="reminder-title" placeholder="Enter reminder title" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="renewal">Renewal</option>
                        <option value="payment">Payment</option>
                        <option value="claim">Claim</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-notes">Notes (Optional)</Label>
                    <Textarea id="reminder-notes" placeholder="Add any additional notes" />
                  </div>
                  <Button>Add Reminder</Button>
                </div>
              </div>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>View and manage your insurance schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                </CardContent>
              </Card>

              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upcoming Renewal</AlertTitle>
                <AlertDescription>Your auto insurance policy will expire in 30 days.</AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Claims Status</CardTitle>
                <CardDescription>Track the status of your insurance claims</CardDescription>
              </CardHeader>
              <CardContent>
                {claims.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Policy</th>
                          <th className="text-left py-3 px-4">Date Filed</th>
                          <th className="text-left py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Last Updated</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claims.map((claim) => (
                          <tr key={claim.id} className="border-b">
                            <td className="py-3 px-4">{claim.policyName}</td>
                            <td className="py-3 px-4">{new Date(claim.claimDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">${claim.amount.toLocaleString()}</td>
                            <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                            <td className="py-3 px-4">{new Date(claim.lastUpdated).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No claims</h3>
                    <p className="mt-2 text-muted-foreground">You haven't filed any claims yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File a New Claim</CardTitle>
                <CardDescription>Submit a new insurance claim for processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="policy">Select Policy</Label>
                    <select
                      id="policy"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Select a policy</option>
                      {policies.map((policy) => (
                        <option key={policy.id} value={policy.id}>
                          {policy.name} ({policy.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incident-date">Incident Date</Label>
                      <Input id="incident-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claim-amount">Claim Amount ($)</Label>
                      <Input id="claim-amount" type="number" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="claim-description">Description</Label>
                    <Textarea
                      id="claim-description"
                      placeholder="Describe what happened and the details of your claim"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Supporting Documents</Label>
                    <div className="border rounded-md p-4">
                      <div className="text-center">
                        <Button variant="outline" className="w-full">
                          Upload Files
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Upload photos, receipts, or other supporting documents (PDF, JPG, PNG)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit Claim</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
