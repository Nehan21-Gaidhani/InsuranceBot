"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, Filter, Search, Star } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

type InsurancePlan = {
  id: string
  name: string
  provider: string
  premium: number
  deductible: number
  coverage: number
  rating: number
  features: string[]
  type: "health" | "auto" | "home" | "life"
  matchScore: number
}

export function PlanMatcher() {
  const [insuranceType, setInsuranceType] = useState<string>("health")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("match")

  // Sample insurance plans data
  const insurancePlans: InsurancePlan[] = [
    {
      id: "1",
      name: "Premium Health Plus",
      provider: "BlueCross Insurance",
      premium: 450,
      deductible: 1000,
      coverage: 90,
      rating: 4.8,
      features: ["Dental Coverage", "Vision Coverage", "Prescription Drugs", "Mental Health", "Specialist Visits"],
      type: "health",
      matchScore: 95,
    },
    {
      id: "2",
      name: "Standard Health Plan",
      provider: "HealthFirst",
      premium: 300,
      deductible: 2000,
      coverage: 80,
      rating: 4.2,
      features: ["Prescription Drugs", "Primary Care", "Emergency Services"],
      type: "health",
      matchScore: 87,
    },
    {
      id: "3",
      name: "Basic Health Coverage",
      provider: "MediCare Solutions",
      premium: 200,
      deductible: 3000,
      coverage: 70,
      rating: 3.9,
      features: ["Primary Care", "Emergency Services"],
      type: "health",
      matchScore: 75,
    },
    {
      id: "4",
      name: "Full Coverage Auto",
      provider: "DriveSecure",
      premium: 180,
      deductible: 500,
      coverage: 100,
      rating: 4.7,
      features: ["Collision", "Comprehensive", "Roadside Assistance", "Rental Car Coverage"],
      type: "auto",
      matchScore: 92,
    },
    {
      id: "5",
      name: "Standard Auto Insurance",
      provider: "AutoProtect",
      premium: 120,
      deductible: 1000,
      coverage: 80,
      rating: 4.1,
      features: ["Collision", "Liability"],
      type: "auto",
      matchScore: 84,
    },
    {
      id: "6",
      name: "Premium Home Protection",
      provider: "HomeShield",
      premium: 220,
      deductible: 1500,
      coverage: 95,
      rating: 4.6,
      features: ["Dwelling Coverage", "Personal Property", "Liability", "Natural Disasters", "Theft"],
      type: "home",
      matchScore: 91,
    },
    {
      id: "7",
      name: "Term Life 30",
      provider: "LifeSecure",
      premium: 85,
      deductible: 0,
      coverage: 100,
      rating: 4.9,
      features: ["30-year Term", "Fixed Premium", "Death Benefit", "Convertible"],
      type: "life",
      matchScore: 89,
    },
  ]

  // Filter and sort plans
  const filteredPlans = insurancePlans
    .filter((plan) => plan.type === insuranceType)
    .filter((plan) => plan.premium >= priceRange[0] && plan.premium <= priceRange[1])
    .filter(
      (plan) =>
        searchQuery === "" ||
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.features.some((feature) => feature.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore
      if (sortBy === "price-low") return a.premium - b.premium
      if (sortBy === "price-high") return b.premium - a.premium
      if (sortBy === "rating") return b.rating - a.rating
      return 0
    })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Plan Matcher</h2>
        <p className="text-muted-foreground">Compare insurance plans and find the best match for your needs</p>
      </div>

      <Tabs value={insuranceType} onValueChange={setInsuranceType}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="auto">Auto</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="life">Life</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans, providers, or features..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Monthly Premium Range</Label>
                    <div className="pt-4">
                      <Slider
                        defaultValue={[0, 1000]}
                        max={1000}
                        step={50}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex justify-between text-sm mt-2">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Coverage Level</Label>
                    <RadioGroup defaultValue="all">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All Levels</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="basic" />
                        <Label htmlFor="basic">Basic (60-75%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard">Standard (75-85%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="premium" id="premium" />
                        <Label htmlFor="premium">Premium (85-100%)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider Rating</Label>
                    <RadioGroup defaultValue="any">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="any-rating" />
                        <Label htmlFor="any-rating">Any Rating</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4plus" id="4plus" />
                        <Label htmlFor="4plus">4+ Stars</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="45plus" id="45plus" />
                        <Label htmlFor="45plus">4.5+ Stars</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Special Features</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {insuranceType === "health" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Switch id="dental" />
                            <Label htmlFor="dental">Dental Coverage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="vision" />
                            <Label htmlFor="vision">Vision Coverage</Label>
                          </div>
                        </>
                      )}
                      {insuranceType === "auto" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Switch id="roadside" />
                            <Label htmlFor="roadside">Roadside Assistance</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="rental" />
                            <Label htmlFor="rental">Rental Coverage</Label>
                          </div>
                        </>
                      )}
                      {insuranceType === "home" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Switch id="flood" />
                            <Label htmlFor="flood">Flood Insurance</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="valuables" />
                            <Label htmlFor="valuables">Valuables Coverage</Label>
                          </div>
                        </>
                      )}
                      {insuranceType === "life" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Switch id="convertible" />
                            <Label htmlFor="convertible">Convertible</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="cashvalue" />
                            <Label htmlFor="cashvalue">Cash Value</Label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" className="mr-2">
                  Reset
                </Button>
                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <div className="space-y-4">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/4 bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r">
                  <div className="text-2xl font-bold">${plan.premium}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                  <div className="mt-4 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(plan.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-1 text-sm">{plan.rating}</span>
                  </div>
                  <Badge className="mt-4 bg-blue-100 text-blue-800 hover:bg-blue-100">{plan.matchScore}% Match</Badge>
                </div>

                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="text-muted-foreground">{plan.provider}</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <Badge variant="outline" className="mb-2 sm:mb-0 sm:ml-2">
                        {plan.coverage}% Coverage
                      </Badge>
                      <Badge variant="outline" className="sm:ml-2">
                        ${plan.deductible} Deductible
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                    <Button variant="outline" className="sm:w-auto">
                      View Details
                    </Button>
                    <Button className="sm:w-auto">Select Plan</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No plans match your criteria. Try adjusting your filters.</div>
          </div>
        )}
      </div>
    </div>
  )
}
