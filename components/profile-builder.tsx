"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, User, FileText, Activity, Shield, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { analyzeProfile } from "@/lib/actions"

type ProfileData = {
  personal: {
    fullName: string
    email: string
    dob: string
    gender: string
    occupation: string
    address: string
  }
  medical: {
    height: string
    weight: string
    conditions: string[]
    medications: string
  }
  lifestyle: {
    activityLevel: number
    smoking: string
    alcohol: string
    riskActivities: string[]
    travel: string
  }
}

type AnalysisResult = {
  riskScore: number
  recommendations: string[]
  analysis: string
  coverageSuggestions: string[]
}

export function ProfileBuilder() {
  const [activeTab, setActiveTab] = useState("personal")
  const [profileCompletion, setProfileCompletion] = useState(25)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<ProfileData>({
    personal: {
      fullName: "",
      email: "",
      dob: "",
      gender: "",
      occupation: "",
      address: "",
    },
    medical: {
      height: "",
      weight: "",
      conditions: [],
      medications: "",
    },
    lifestyle: {
      activityLevel: 50,
      smoking: "",
      alcohol: "",
      riskActivities: [],
      travel: "",
    },
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update profile completion progress
    if (value === "medical" && profileCompletion === 25) {
      setProfileCompletion(50)
    } else if (value === "lifestyle" && profileCompletion === 50) {
      setProfileCompletion(75)
    } else if (value === "results" && profileCompletion === 75) {
      setProfileCompletion(100)
    }
  }

  const handlePersonalDataChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }))
  }

  const handleMedicalDataChange = (field: string, value: string | string[]) => {
    setProfileData((prev) => ({
      ...prev,
      medical: {
        ...prev.medical,
        [field]: value,
      },
    }))
  }

  const handleLifestyleDataChange = (field: string, value: string | number | string[]) => {
    setProfileData((prev) => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [field]: value,
      },
    }))
  }

  const handleConditionToggle = (condition: string, checked: boolean) => {
    const currentConditions = profileData.medical.conditions
    if (checked) {
      setProfileData((prev) => ({
        ...prev,
        medical: {
          ...prev.medical,
          conditions: [...currentConditions, condition],
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        medical: {
          ...prev.medical,
          conditions: currentConditions.filter((c) => c !== condition),
        },
      }))
    }
  }

  const handleRiskActivityToggle = (activity: string, checked: boolean) => {
    const currentActivities = profileData.lifestyle.riskActivities
    if (checked) {
      setProfileData((prev) => ({
        ...prev,
        lifestyle: {
          ...prev.lifestyle,
          riskActivities: [...currentActivities, activity],
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        lifestyle: {
          ...prev.lifestyle,
          riskActivities: currentActivities.filter((a) => a !== activity),
        },
      }))
    }
  }

  const validateProfile = () => {
    const { personal, medical, lifestyle } = profileData

    if (!personal.fullName || !personal.dob || !personal.occupation) {
      return "Please complete your personal information (name, date of birth, and occupation are required)."
    }

    if (!medical.height || !medical.weight) {
      return "Please provide your height and weight for accurate risk assessment."
    }

    if (!lifestyle.smoking || !lifestyle.alcohol || !lifestyle.travel) {
      return "Please complete your lifestyle information for comprehensive analysis."
    }

    return null
  }

  const handleAnalyzeProfile = async () => {
    // Validate profile data
    const validationError = validateProfile()
    if (validationError) {
      setAnalysisError(validationError)
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)

    try {
      console.log("Starting profile analysis with data:", profileData)
      const result = await analyzeProfile(profileData)
      console.log("Analysis completed successfully:", result)
      setAnalysisResult(result)
      setProfileCompletion(100)
    } catch (error) {
      console.error("Error analyzing profile:", error)
      setAnalysisError(error instanceof Error ? error.message : "An unexpected error occurred during analysis.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const retryAnalysis = () => {
    setAnalysisError(null)
    handleAnalyzeProfile()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Smart Profile Builder</h2>
          <p className="text-muted-foreground">Build your profile for AI-powered insurance recommendations</p>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-sm mb-1">
            <span>Profile completion</span>
            <span className="font-medium">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Medical</span>
          </TabsTrigger>
          <TabsTrigger value="lifestyle" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Lifestyle</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Provide your basic details to help us build your insurance profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={profileData.personal.fullName}
                    onChange={(e) => handlePersonalDataChange("fullName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={profileData.personal.email}
                    onChange={(e) => handlePersonalDataChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profileData.personal.dob}
                    onChange={(e) => handlePersonalDataChange("dob", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profileData.personal.gender}
                    onValueChange={(value) => handlePersonalDataChange("gender", value)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    placeholder="Software Engineer"
                    value={profileData.personal.occupation}
                    onChange={(e) => handlePersonalDataChange("occupation", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main St, City, State, ZIP"
                  value={profileData.personal.address}
                  onChange={(e) => handlePersonalDataChange("address", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save Draft</Button>
              <Button onClick={() => handleTabChange("medical")}>Continue to Medical</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Your medical history helps us determine appropriate coverage options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Privacy Notice</AlertTitle>
                <AlertDescription>
                  Your medical information is protected and only used for insurance assessment purposes.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={profileData.medical.height}
                      onChange={(e) => handleMedicalDataChange("height", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={profileData.medical.weight}
                      onChange={(e) => handleMedicalDataChange("weight", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Do you have any pre-existing medical conditions?</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["Diabetes", "Heart Disease", "Asthma", "Cancer", "Hypertension", "None"].map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Switch
                          id={`condition-${condition}`}
                          checked={profileData.medical.conditions.includes(condition)}
                          onCheckedChange={(checked) => handleConditionToggle(condition, checked)}
                        />
                        <Label htmlFor={`condition-${condition}`}>{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder="List any medications you're currently taking"
                    value={profileData.medical.medications}
                    onChange={(e) => handleMedicalDataChange("medications", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("personal")}>
                Back
              </Button>
              <Button onClick={() => handleTabChange("lifestyle")}>Continue to Lifestyle</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Information</CardTitle>
              <CardDescription>
                Your lifestyle choices help us assess risk factors and recommend appropriate coverage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Physical Activity Level: {profileData.lifestyle.activityLevel}/100</Label>
                  <div className="pt-2">
                    <Slider
                      value={[profileData.lifestyle.activityLevel]}
                      onValueChange={(value) => handleLifestyleDataChange("activityLevel", value[0])}
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Sedentary</span>
                      <span>Moderate</span>
                      <span>Very Active</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking Status *</Label>
                    <Select
                      value={profileData.lifestyle.smoking}
                      onValueChange={(value) => handleLifestyleDataChange("smoking", value)}
                    >
                      <SelectTrigger id="smoking">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never smoked</SelectItem>
                        <SelectItem value="former">Former smoker</SelectItem>
                        <SelectItem value="occasional">Occasional smoker</SelectItem>
                        <SelectItem value="regular">Regular smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alcohol">Alcohol Consumption *</Label>
                    <Select
                      value={profileData.lifestyle.alcohol}
                      onValueChange={(value) => handleLifestyleDataChange("alcohol", value)}
                    >
                      <SelectTrigger id="alcohol">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="light">Light (1-2 drinks/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-7 drinks/week)</SelectItem>
                        <SelectItem value="heavy">Heavy (8+ drinks/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Do you participate in any high-risk activities?</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {["Skydiving", "Scuba Diving", "Rock Climbing", "Motorsports", "Extreme Sports", "None"].map(
                      (activity) => (
                        <div key={activity} className="flex items-center space-x-2">
                          <Switch
                            id={`activity-${activity}`}
                            checked={profileData.lifestyle.riskActivities.includes(activity)}
                            onCheckedChange={(checked) => handleRiskActivityToggle(activity, checked)}
                          />
                          <Label htmlFor={`activity-${activity}`}>{activity}</Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel">International Travel Frequency *</Label>
                  <Select
                    value={profileData.lifestyle.travel}
                    onValueChange={(value) => handleLifestyleDataChange("travel", value)}
                  >
                    <SelectTrigger id="travel">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rarely">Rarely (0-1 times/year)</SelectItem>
                      <SelectItem value="occasionally">Occasionally (2-3 times/year)</SelectItem>
                      <SelectItem value="frequently">Frequently (4+ times/year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("medical")}>
                Back
              </Button>
              <Button
                onClick={() => {
                  handleTabChange("results")
                  handleAnalyzeProfile()
                }}
              >
                Analyze Profile with AI
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Risk Evaluation & Coverage Suggestions</CardTitle>
              <CardDescription>
                Our AI analyzes your complete profile to provide personalized insurance recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Analysis Error</AlertTitle>
                  <AlertDescription className="mt-2">
                    {analysisError}
                    <Button variant="outline" size="sm" className="mt-2 ml-2" onClick={retryAnalysis}>
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {isAnalyzing ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <h3 className="text-lg font-medium">AI is Analyzing Your Profile</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    Processing your personal, medical, and lifestyle data to generate personalized recommendations...
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      Calculating risk factors based on your profile
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      Analyzing health and lifestyle data
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      Generating personalized recommendations
                    </div>
                  </div>
                </div>
              ) : analysisResult ? (
                <>
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold">{analysisResult.riskScore}</div>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={
                            analysisResult.riskScore < 40
                              ? "#10b981"
                              : analysisResult.riskScore < 70
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                          strokeWidth="10"
                          strokeDasharray="282.7"
                          strokeDashoffset={282.7 - (282.7 * analysisResult.riskScore) / 100}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="font-medium">Your AI-Generated Risk Score</div>
                      <div className="text-sm text-muted-foreground">
                        {analysisResult.riskScore < 40
                          ? "Low Risk - Excellent rates available"
                          : analysisResult.riskScore < 70
                            ? "Moderate Risk - Good coverage options"
                            : "Higher Risk - Specialized coverage recommended"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">AI Analysis of Your Profile</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">{analysisResult.analysis}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Personalized Recommendations</h3>
                    <div className="space-y-3">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Recommended Coverage Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.coverageSuggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Based on your AI analysis, we recommend exploring the suggested coverage types. You can use our
                      Analytics section to compare specific policies or chat with our AI assistant for more detailed
                      guidance.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Ready for AI Analysis</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    Complete all sections of your profile and click "Analyze Profile with AI" to receive personalized
                    risk evaluation and coverage suggestions powered by advanced AI.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("lifestyle")}>
                Back
              </Button>
              {analysisResult && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={retryAnalysis}>
                    Re-analyze
                  </Button>
                  <Button>Save Results</Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
