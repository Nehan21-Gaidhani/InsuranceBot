"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

type Message = {
  role: "user" | "assistant"
  content: string
}

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

export async function handleChatCompletion(
  messages: Message[],
  userMessage: Message,
  shortChatMode = false,
): Promise<string> {
  try {
    // Prepare conversation history for the AI
    const conversationHistory = messages
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    // Create the prompt with insurance domain knowledge
    const prompt = `
You are an AI Insurance Advisor, an expert in all types of insurance policies and coverage options.
You provide helpful, accurate information about insurance topics.

${
  shortChatMode
    ? `
IMPORTANT: You are now in SHORT CHAT MODE. Respond like a knowledgeable friend giving quick, casual advice:
- Keep responses brief (2-3 sentences max)
- Use casual, friendly language
- Skip detailed explanations unless specifically asked
- Be direct and to the point
- Use simple words and avoid jargon
- Think of it like texting a friend who knows insurance
`
    : `
Provide detailed, comprehensive responses with proper formatting.
`
}

Previous conversation:
${conversationHistory}

User: ${userMessage.content}

${
  shortChatMode
    ? `
Give a quick, friendly response like you're texting a friend. Keep it short and casual but accurate.
`
    : `
Provide a helpful, informative response about insurance. Use proper formatting with:
- **Bold text** for important terms and key points
- *Italic text* for emphasis and definitions
- __Underlined text__ for critical information
- ==Highlighted text== for warnings or very important notes
- Numbered lists (1., 2., 3.) for step-by-step processes
- Bullet points (*) for features, benefits, or lists
- Clear headings using # for main topics and ## for subtopics
- Use \`code formatting\` for specific terms, amounts, or technical details

Structure your response professionally with proper headings, bullet points, and formatting to make it easy to read and understand.
`
}
`

    // Generate response using AI SDK with Gemini
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: `You are an AI Insurance Advisor specializing in explaining insurance policies, coverage options, and helping users understand complex insurance terms in simple language. You're knowledgeable about health, auto, home, life, travel, and business insurance.

${
  shortChatMode
    ? `
SHORT CHAT MODE ACTIVE:
- Respond like a knowledgeable friend
- Keep responses under 50 words when possible
- Use casual, conversational tone
- Be direct and helpful
- Skip lengthy explanations
- Use everyday language, not insurance jargon
- Think "quick text message to a friend"
`
    : `
FORMATTING GUIDELINES:
- Use **bold** for important insurance terms, key points, and critical information
- Use *italic* for emphasis, definitions, and explanations
- Use __underline__ for warnings, deadlines, or very important information
- Use ==highlight== for critical warnings or must-know information
- Use numbered lists (1., 2., 3.) for processes, steps, or rankings
- Use bullet points (*) for features, benefits, coverage options, or simple lists
- Use # for main headings and ## for subheadings
- Use \`backticks\` for specific amounts, percentages, or technical terms
- Structure responses with clear sections and proper formatting
- Make responses visually appealing and easy to scan

Always provide comprehensive, well-formatted responses that are easy to read and understand.
`
}`,
    })

    return text
  } catch (error) {
    console.error("Error in handleChatCompletion:", error)
    return "I'm sorry, I encountered an error processing your request. Please try again."
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // Skip translation if target is English
    if (targetLanguage === "en") return text

    const prompt = `
Translate the following insurance-related text into ${getLanguageName(targetLanguage)}. 
Maintain the professional tone and insurance terminology accuracy.
Keep any formatting like paragraph breaks, bullet points, bold text, italic text, and numbered lists.
Preserve all markdown formatting including **, *, __, ==, \`, #, ##, etc.

Text to translate:
${text}

Important: Provide ONLY the translated text with preserved formatting without any explanations or notes.
`

    const { text: translatedText } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: `You are a professional translator specializing in insurance and financial terminology. 
Translate the provided text accurately into the requested language while maintaining the original meaning, 
tone, and ALL formatting including markdown. Do not add any comments or explanations - return only the translated text with preserved formatting.`,
    })

    return translatedText
  } catch (error) {
    console.error("Translation error:", error)
    throw new Error("Failed to translate text. Please try again.")
  }
}

function getLanguageName(languageCode: string): string {
  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    sd: "Sindhi",
    ta: "Tamil",
    te: "Telugu",
    ur: "Urdu",
    gu: "Gujarati",
    mr: "Marathi",
    bn: "Bengali",
    ml: "Malayalam",
    kn: "Kannada",
    pa: "Punjabi",
  }

  return languages[languageCode] || languageCode
}

export async function analyzeProfile(profileData: ProfileData): Promise<{
  riskScore: number
  recommendations: string[]
  analysis: string
  coverageSuggestions: string[]
}> {
  try {
    // Calculate age from date of birth
    const age = profileData.personal.dob
      ? new Date().getFullYear() - new Date(profileData.personal.dob).getFullYear()
      : "Not provided"

    // Calculate BMI if height and weight are provided
    const bmi =
      profileData.medical.height && profileData.medical.weight
        ? (
            Number.parseFloat(profileData.medical.weight) /
            Math.pow(Number.parseFloat(profileData.medical.height) / 100, 2)
          ).toFixed(1)
        : "Not calculated"

    const prompt = `
You are an expert insurance risk assessor and advisor. Analyze this detailed insurance profile and provide a comprehensive risk assessment with personalized recommendations.

PERSONAL PROFILE:
- Full Name: ${profileData.personal.fullName || "Not provided"}
- Age: ${age} years old
- Gender: ${profileData.personal.gender || "Not specified"}
- Occupation: ${profileData.personal.occupation || "Not provided"}
- Location: ${profileData.personal.address || "Not provided"}

HEALTH & MEDICAL DATA:
- Height: ${profileData.medical.height || "Not provided"} cm
- Weight: ${profileData.medical.weight || "Not provided"} kg
- BMI: ${bmi}
- Pre-existing Medical Conditions: ${profileData.medical.conditions.length > 0 ? profileData.medical.conditions.join(", ") : "None reported"}
- Current Medications: ${profileData.medical.medications || "None reported"}

LIFESTYLE ASSESSMENT:
- Physical Activity Level: ${profileData.lifestyle.activityLevel}/100 (where 0=sedentary, 100=very active)
- Smoking Status: ${profileData.lifestyle.smoking || "Not specified"}
- Alcohol Consumption: ${profileData.lifestyle.alcohol || "Not specified"}
- High-Risk Activities: ${profileData.lifestyle.riskActivities.length > 0 ? profileData.lifestyle.riskActivities.join(", ") : "None"}
- International Travel Frequency: ${profileData.lifestyle.travel || "Not specified"}

ANALYSIS REQUIREMENTS:
1. Calculate a risk score from 1-100 (where 1 is lowest risk, 100 is highest risk)
2. Consider ALL factors: age, occupation, health conditions, BMI, lifestyle choices, activities
3. Provide 4-6 specific insurance recommendations based on this exact profile
4. Give detailed analysis explaining the risk factors and reasoning
5. Suggest 3-5 specific coverage types that would benefit this person

IMPORTANT: Base your analysis on the ACTUAL data provided. Consider:
- Age-related risks and insurance needs
- Occupation-specific risks and requirements
- Health conditions and their impact on insurance
- Lifestyle factors affecting risk assessment
- Geographic considerations if location is provided

Please respond in this EXACT JSON format (ensure valid JSON):
{
  "riskScore": [number between 1-100],
  "recommendations": [
    "Specific recommendation 1 based on profile",
    "Specific recommendation 2 based on profile",
    "Specific recommendation 3 based on profile",
    "Specific recommendation 4 based on profile"
  ],
  "analysis": "Detailed analysis paragraph explaining the risk assessment, considering age, health, lifestyle, occupation, and other factors from the profile. Mention specific factors that influenced the risk score.",
  "coverageSuggestions": [
    "Specific coverage type 1",
    "Specific coverage type 2", 
    "Specific coverage type 3",
    "Specific coverage type 4"
  ]
}
`

    console.log("Sending profile data to Gemini for analysis...")

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: `You are an expert insurance risk assessor with 20+ years of experience. You must analyze the provided profile data and return a valid JSON response with personalized risk assessment and recommendations. 

CRITICAL: Your response must be ONLY valid JSON, no additional text or formatting. Base all recommendations on the actual profile data provided, not generic advice.`,
    })

    console.log("Received response from Gemini:", text)

    // Clean the response to ensure it's valid JSON
    let cleanedText = text.trim()

    // Remove any markdown formatting if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\s*/, "").replace(/```\s*$/, "")
    }
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\s*/, "").replace(/```\s*$/, "")
    }

    // Parse the JSON response
    try {
      const result = JSON.parse(cleanedText)

      // Validate the response structure
      if (!result.riskScore || !result.recommendations || !result.analysis || !result.coverageSuggestions) {
        throw new Error("Invalid response structure from Gemini")
      }

      // Ensure riskScore is within valid range
      if (result.riskScore < 1 || result.riskScore > 100) {
        result.riskScore = Math.max(1, Math.min(100, result.riskScore))
      }

      console.log("Successfully parsed Gemini response:", result)
      return result
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError)
      console.error("Raw response:", cleanedText)

      // If JSON parsing fails, try to extract information manually
      throw new Error("Failed to parse AI response. Please try again.")
    }
  } catch (error) {
    console.error("Error in analyzeProfile:", error)
    throw new Error("Failed to analyze profile. Please check your internet connection and try again.")
  }
}
