"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, Star, Eye, Award, Shield, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type PolicyType = "health" | "travel" | "auto" | "home" | "life" | "business" | "pet" | "disability"

type PolicyData = {
  id: string
  name: string
  provider: string
  type: PolicyType
  rating: number
  referrals: number
  premium: number
  coverage: number
  features: string[]
  description: string
  pros: string[]
  cons: string[]
  bestFor: string[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export function Analytics() {
  const [selectedPolicyType, setSelectedPolicyType] = useState<PolicyType | "">("")
  const [filteredPolicies, setFilteredPolicies] = useState<PolicyData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyData | null>(null)

  // Sample policy data
  const allPolicies: PolicyData[] = [
    // Health Insurance
    {
      id: "h1",
      name: "Premium Health Plus",
      provider: "BlueCross Insurance",
      type: "health",
      rating: 4.8,
      referrals: 2450,
      premium: 450,
      coverage: 95,
      features: ["Dental Coverage", "Vision Coverage", "Mental Health", "Prescription Drugs", "Specialist Visits"],
      description: "Comprehensive health insurance with extensive coverage for all medical needs.",
      pros: ["Excellent coverage", "Wide network", "Fast claim processing", "24/7 support"],
      cons: ["Higher premium", "Complex paperwork"],
      bestFor: ["Families", "Chronic conditions", "Frequent medical visits"],
    },
    {
      id: "h2",
      name: "Standard Health Plan",
      provider: "HealthFirst",
      type: "health",
      rating: 4.2,
      referrals: 1890,
      premium: 300,
      coverage: 80,
      features: ["Basic Coverage", "Emergency Services", "Prescription Drugs"],
      description: "Affordable health insurance with essential coverage for basic medical needs.",
      pros: ["Affordable premium", "Good basic coverage", "Easy enrollment"],
      cons: ["Limited specialist coverage", "Higher deductibles"],
      bestFor: ["Young adults", "Budget-conscious", "Basic health needs"],
    },
    {
      id: "h3",
      name: "Basic Health Coverage",
      provider: "MediCare Solutions",
      type: "health",
      rating: 3.9,
      referrals: 1200,
      premium: 200,
      coverage: 70,
      features: ["Emergency Services", "Primary Care"],
      description: "Basic health insurance for essential medical coverage.",
      pros: ["Very affordable", "Quick approval", "Simple terms"],
      cons: ["Limited coverage", "High out-of-pocket costs"],
      bestFor: ["Students", "Part-time workers", "Emergency coverage only"],
    },

    // Travel Insurance
    {
      id: "t1",
      name: "Global Travel Protection",
      provider: "TravelSecure",
      type: "travel",
      rating: 4.7,
      referrals: 3200,
      premium: 85,
      coverage: 90,
      features: ["Trip Cancellation", "Medical Emergency", "Lost Luggage", "Flight Delay", "Adventure Sports"],
      description: "Comprehensive travel insurance for international and domestic trips.",
      pros: ["Worldwide coverage", "Adventure sports included", "24/7 assistance", "Quick claims"],
      cons: ["Higher cost for short trips", "Some exclusions apply"],
      bestFor: ["International travelers", "Adventure seekers", "Business travelers"],
    },
    {
      id: "t2",
      name: "Budget Travel Plan",
      provider: "SafeJourney",
      type: "travel",
      rating: 4.1,
      referrals: 2100,
      premium: 45,
      coverage: 75,
      features: ["Trip Cancellation", "Medical Emergency", "Lost Luggage"],
      description: "Affordable travel insurance for basic trip protection.",
      pros: ["Budget-friendly", "Essential coverage", "Easy to purchase"],
      cons: ["Limited coverage", "No adventure sports", "Lower claim limits"],
      bestFor: ["Budget travelers", "Domestic trips", "Short vacations"],
    },
    {
      id: "t3",
      name: "Premium Explorer",
      provider: "WorldWide Insurance",
      type: "travel",
      rating: 4.9,
      referrals: 2800,
      premium: 120,
      coverage: 98,
      features: ["Comprehensive Coverage", "Cancel for Any Reason", "Rental Car", "Business Equipment"],
      description: "Premium travel insurance with maximum coverage and flexibility.",
      pros: ["Cancel for any reason", "Highest coverage limits", "Premium support", "Business coverage"],
      cons: ["Most expensive option", "Complex terms"],
      bestFor: ["Luxury travelers", "Business executives", "High-value trips"],
    },

    // Auto Insurance
    {
      id: "a1",
      name: "Full Coverage Auto",
      provider: "DriveSecure",
      type: "auto",
      rating: 4.6,
      referrals: 4100,
      premium: 180,
      coverage: 95,
      features: ["Collision", "Comprehensive", "Roadside Assistance", "Rental Car", "Gap Coverage"],
      description: "Complete auto insurance protection with comprehensive coverage.",
      pros: ["Full protection", "Excellent roadside assistance", "Fast claims", "Good discounts"],
      cons: ["Higher premium", "Deductible applies"],
      bestFor: ["New cars", "Financed vehicles", "High-value cars"],
    },
    {
      id: "a2",
      name: "Standard Auto Plan",
      provider: "AutoProtect",
      type: "auto",
      rating: 4.0,
      referrals: 2900,
      premium: 120,
      coverage: 80,
      features: ["Liability", "Collision", "Basic Roadside"],
      description: "Standard auto insurance with essential coverage.",
      pros: ["Affordable", "Good basic coverage", "Reliable service"],
      cons: ["Limited extras", "Basic roadside only"],
      bestFor: ["Older vehicles", "Budget-conscious drivers", "Basic needs"],
    },

    // Home Insurance
    {
      id: "ho1",
      name: "Premium Home Protection",
      provider: "HomeShield",
      type: "home",
      rating: 4.5,
      referrals: 1800,
      premium: 220,
      coverage: 92,
      features: ["Dwelling", "Personal Property", "Liability", "Natural Disasters", "Identity Theft"],
      description: "Comprehensive home insurance with extensive protection.",
      pros: ["Comprehensive coverage", "Natural disaster protection", "Identity theft coverage"],
      cons: ["Higher premium", "Complex claims process"],
      bestFor: ["Homeowners", "High-value homes", "Disaster-prone areas"],
    },
    {
      id: "ho2",
      name: "Basic Home Coverage",
      provider: "SafeHome",
      type: "home",
      rating: 3.8,
      referrals: 1200,
      premium: 150,
      coverage: 75,
      features: ["Dwelling", "Personal Property", "Basic Liability"],
      description: "Basic home insurance for essential protection.",
      pros: ["Affordable", "Simple coverage", "Easy claims"],
      cons: ["Limited protection", "No natural disasters"],
      bestFor: ["First-time buyers", "Budget-conscious", "Low-risk areas"],
    },

    // Life Insurance
    {
      id: "l1",
      name: "Term Life 30",
      provider: "LifeSecure",
      type: "life",
      rating: 4.9,
      referrals: 3500,
      premium: 85,
      coverage: 100,
      features: ["30-year Term", "Fixed Premium", "Convertible", "Accelerated Benefits"],
      description: "30-year term life insurance with guaranteed level premiums.",
      pros: ["Guaranteed premiums", "Convertible option", "High coverage", "Accelerated benefits"],
      cons: ["Term expires", "No cash value"],
      bestFor: ["Young families", "Mortgage protection", "Income replacement"],
    },
    {
      id: "l2",
      name: "Whole Life Plus",
      provider: "EternalCare",
      type: "life",
      rating: 4.3,
      referrals: 2200,
      premium: 250,
      coverage: 85,
      features: ["Permanent Coverage", "Cash Value", "Dividends", "Loan Options"],
      description: "Whole life insurance with cash value accumulation.",
      pros: ["Permanent coverage", "Cash value growth", "Dividend potential", "Loan options"],
      cons: ["Higher premium", "Complex structure", "Lower returns"],
      bestFor: ["Estate planning", "Long-term savings", "Permanent needs"],
    },

    // Business Insurance
    {
      id: "b1",
      name: "Business Comprehensive",
      provider: "BizProtect",
      type: "business",
      rating: 4.4,
      referrals: 1600,
      premium: 350,
      coverage: 88,
      features: ["General Liability", "Property", "Workers Comp", "Cyber Liability", "Business Interruption"],
      description: "Complete business insurance package for comprehensive protection.",
      pros: ["All-in-one coverage", "Cyber protection", "Business interruption", "Expert support"],
      cons: ["Higher cost", "Complex terms", "Industry-specific exclusions"],
      bestFor: ["Small businesses", "Tech companies", "Service providers"],
    },
    {
      id: "b2",
      name: "Startup Shield",
      provider: "NewBiz Insurance",
      type: "business",
      rating: 4.1,
      referrals: 980,
      premium: 180,
      coverage: 75,
      features: ["General Liability", "Professional Liability", "Cyber Basic"],
      description: "Affordable business insurance designed for startups and small businesses.",
      pros: ["Startup-friendly", "Affordable", "Essential coverage", "Quick setup"],
      cons: ["Limited coverage", "No property protection", "Basic cyber coverage"],
      bestFor: ["Startups", "Freelancers", "Online businesses"],
    },

    // Pet Insurance
    {
      id: "p1",
      name: "Complete Pet Care",
      provider: "PetGuard",
      type: "pet",
      rating: 4.6,
      referrals: 2400,
      premium: 65,
      coverage: 90,
      features: ["Accidents", "Illness", "Wellness", "Hereditary Conditions", "Prescription Drugs"],
      description: "Comprehensive pet insurance covering accidents, illness, and wellness care.",
      pros: ["Comprehensive coverage", "Wellness included", "Fast reimbursement", "No age limits"],
      cons: ["Higher premium", "Waiting periods", "Pre-existing exclusions"],
      bestFor: ["All pets", "Comprehensive care", "Peace of mind"],
    },
    {
      id: "p2",
      name: "Basic Pet Protection",
      provider: "PetSafe",
      type: "pet",
      rating: 4.0,
      referrals: 1500,
      premium: 35,
      coverage: 70,
      features: ["Accidents", "Basic Illness"],
      description: "Basic pet insurance for accidents and common illnesses.",
      pros: ["Affordable", "Essential coverage", "Simple claims"],
      cons: ["Limited coverage", "No wellness", "Age restrictions"],
      bestFor: ["Budget-conscious", "Young pets", "Basic protection"],
    },

    // Disability Insurance
    {
      id: "d1",
      name: "Income Guardian",
      provider: "DisabilityFirst",
      type: "disability",
      rating: 4.7,
      referrals: 1900,
      premium: 120,
      coverage: 85,
      features: ["Short-term", "Long-term", "Partial Benefits", "Cost of Living Adjustments"],
      description: "Comprehensive disability insurance protecting your income.",
      pros: ["Income protection", "Flexible benefits", "Cost adjustments", "Quick approval"],
      cons: ["Premium cost", "Medical underwriting", "Benefit limitations"],
      bestFor: ["High earners", "Self-employed", "Physical workers"],
    },
  ]

  const policyTypes = [
    { value: "health", label: "Health Insurance" },
    { value: "travel", label: "Travel Insurance" },
    { value: "auto", label: "Auto Insurance" },
    { value: "home", label: "Home Insurance" },
    { value: "life", label: "Life Insurance" },
    { value: "business", label: "Business Insurance" },
    { value: "pet", label: "Pet Insurance" },
    { value: "disability", label: "Disability Insurance" },
  ]

  const handleGetPolicies = () => {
    if (!selectedPolicyType) return

    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const filtered = allPolicies
        .filter((policy) => policy.type === selectedPolicyType)
        .sort((a, b) => b.rating - a.rating) // Sort by rating (best to worst)

      setFilteredPolicies(filtered)
      setIsLoading(false)
    }, 1000)
  }

  // Prepare chart data
  const chartData = filteredPolicies.map((policy) => ({
    name: policy.name.split(" ").slice(0, 2).join(" "), // Shorten names for chart
    referrals: policy.referrals,
    rating: policy.rating,
  }))

  const pieData = filteredPolicies.map((policy, index) => ({
    name: policy.name,
    value: policy.referrals,
    color: COLORS[index % COLORS.length],
  }))

  const totalReferrals = filteredPolicies.reduce((sum, policy) => sum + policy.referrals, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Insurance Analytics Dashboard
        </h2>
        <p className="text-muted-foreground">Analyze and compare insurance policies with detailed insights</p>
      </div>

      {/* Policy Selection */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Policy Analysis
          </CardTitle>
          <CardDescription>Select a policy type to view detailed analytics and comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedPolicyType} onValueChange={(value: PolicyType) => setSelectedPolicyType(value)}>
                <SelectTrigger className="transition-all duration-200 hover:border-blue-500">
                  <SelectValue placeholder="Select policy type..." />
                </SelectTrigger>
                <SelectContent>
                  {policyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="transition-colors duration-200">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGetPolicies}
              disabled={!selectedPolicyType || isLoading}
              className="transition-all duration-200 hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                "Get Policies"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredPolicies.length > 0 && (
        <div className="space-y-6 animate-slide-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Policies</p>
                    <p className="text-2xl font-bold">{filteredPolicies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{totalReferrals.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">
                      {(filteredPolicies.reduce((sum, p) => sum + p.rating, 0) / filteredPolicies.length).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Avg Premium</p>
                    <p className="text-2xl font-bold">
                      ${Math.round(filteredPolicies.reduce((sum, p) => sum + p.premium, 0) / filteredPolicies.length)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Referrals by Policy</CardTitle>
                <CardDescription>Number of people who refer each policy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="referrals" fill="#3b82f6" className="transition-all duration-300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Referral Distribution</CardTitle>
                <CardDescription>Percentage breakdown of referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Policy List */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Policy Rankings (Best to Worst)</CardTitle>
              <CardDescription>Policies ranked by rating and user satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPolicies.map((policy, index) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{policy.name}</h3>
                        <p className="text-sm text-muted-foreground">{policy.provider}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{policy.rating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {policy.referrals.toLocaleString()} referrals
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">${policy.premium}/mo</div>
                        <div className="text-sm text-muted-foreground">{policy.coverage}% coverage</div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:scale-105"
                            onClick={() => setSelectedPolicy(policy)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Award className="h-5 w-5 text-blue-600" />
                              {policy.name}
                            </DialogTitle>
                            <DialogDescription>{policy.provider}</DialogDescription>
                          </DialogHeader>

                          {selectedPolicy && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium">Rating: {selectedPolicy.rating}/5</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>{selectedPolicy.referrals.toLocaleString()} referrals</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                    <span>${selectedPolicy.premium}/month</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-purple-500" />
                                    <span>{selectedPolicy.coverage}% coverage</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-muted-foreground">{selectedPolicy.description}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Key Features</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedPolicy.features.map((feature, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2 text-green-600">Pros</h4>
                                  <ul className="space-y-1">
                                    {selectedPolicy.pros.map((pro, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 text-red-600">Cons</h4>
                                  <ul className="space-y-1">
                                    {selectedPolicy.cons.map((con, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Best For</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedPolicy.bestFor.map((item, idx) => (
                                    <Badge key={idx} variant="outline">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-2 pt-4">
                                <Button className="flex-1">Get Quote</Button>
                                <Button variant="outline" className="flex-1">
                                  Compare
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
