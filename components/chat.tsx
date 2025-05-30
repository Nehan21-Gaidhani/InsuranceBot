"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { handleChatCompletion, translateText } from "@/lib/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

type Message = {
  role: "user" | "assistant"
  content: string
  originalContent?: string
}

// Updated language options without flags
const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "sd", name: "Sindhi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ur", name: "Urdu" },
  { code: "gu", name: "Gujarati" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "pa", name: "Punjabi" },
]

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Insurance Advisor. How can I help you today? You can ask me about insurance policies, coverage options, or use our specialized tools for personalized assistance.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("en")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [shortChatMode, setShortChatMode] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check for browser support of speech recognition and synthesis
  useEffect(() => {
    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setRecognitionSupported(true)
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started")
        setIsListening(true)
      }

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setInput(finalTranscript.trim())
          setIsListening(false)
        } else {
          setInput(interimTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)

        switch (event.error) {
          case "no-speech":
            console.log("No speech detected. Please try speaking again.")
            break
          case "audio-capture":
            console.error("No microphone was found. Please check your microphone settings.")
            break
          case "not-allowed":
            console.error("Microphone permission denied. Please allow microphone access.")
            break
          case "network":
            console.error("Network error occurred during speech recognition.")
            break
          default:
            console.error("Speech recognition error:", event.error)
        }
      }

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended")
        setIsListening(false)
      }

      recognitionRef.current.onnomatch = () => {
        console.log("No speech was recognized")
        setIsListening(false)
      }
    }

    // Check for speech synthesis support
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSupported(true)
      speechSynthesisRef.current = new SpeechSynthesisUtterance()

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        console.log("Available voices:", voices.length)
      }

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
      loadVoices()
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log("Recognition cleanup error:", error)
        }
      }
      if (window.speechSynthesis) {
        try {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel()
          }
        } catch (error) {
          console.log("Speech synthesis cleanup error:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguageCode(language)
    }
  }, [language])

  const getLanguageCode = (lang: string): string => {
    const speechLanguageCodes: Record<string, string> = {
      en: "en-US",
      hi: "hi-IN",
      sd: "sd-IN",
      ta: "ta-IN",
      te: "te-IN",
      ur: "ur-PK",
      gu: "gu-IN",
      mr: "mr-IN",
      bn: "bn-IN",
      ml: "ml-IN",
      kn: "kn-IN",
      pa: "pa-IN",
    }
    return speechLanguageCodes[lang] || "en-US"
  }

  const toggleListening = () => {
    if (!recognitionSupported) {
      console.error("Speech recognition not supported")
      return
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop()
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
        setIsListening(false)
      }
    } else {
      try {
        setInput("")

        if (recognitionRef.current) {
          recognitionRef.current.lang = getLanguageCode(language)
          recognitionRef.current.start()
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)

        if (error instanceof Error) {
          if (error.name === "InvalidStateError") {
            console.log("Speech recognition is already active")
          } else if (error.name === "NotAllowedError") {
            console.error("Microphone permission denied")
          }
        }
      }
    }
  }

  const speakText = (text: string) => {
    if (!speechSupported || !speechSynthesisRef.current) {
      console.error("Speech synthesis not supported")
      return
    }

    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel()

      // Wait a bit for cancellation to complete
      setTimeout(() => {
        const cleanText = text
          .replace(/<[^>]*>/g, "")
          .replace(/\n+/g, " ")
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/__/g, "")
          .replace(/==/g, "")
          .replace(/`/g, "")
          .replace(/#/g, "")
          .trim()

        if (!cleanText) {
          console.log("No text to speak")
          return
        }

        // Create a new utterance instance to avoid reuse issues
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 1

        // Find appropriate voice for the selected language
        const voices = window.speechSynthesis.getVoices()
        const languageCode = getLanguageCode(language)
        const languageVoice = voices.find(
          (voice) => voice.lang.startsWith(languageCode.split("-")[0]) || voice.lang === languageCode,
        )

        if (languageVoice) {
          utterance.voice = languageVoice
          console.log("Using voice:", languageVoice.name)
        }

        utterance.lang = languageCode

        // Event handlers with better error handling
        utterance.onstart = () => {
          setIsSpeaking(true)
          console.log("Speech started")
        }

        utterance.onend = () => {
          setIsSpeaking(false)
          console.log("Speech ended")
        }

        utterance.onerror = (event) => {
          setIsSpeaking(false)
          console.log("Speech synthesis error:", event.error)

          // Handle specific error types gracefully
          switch (event.error) {
            case "interrupted":
              console.log("Speech was interrupted - this is normal when stopping speech")
              break
            case "canceled":
              console.log("Speech was canceled")
              break
            case "not-allowed":
              console.error("Speech synthesis not allowed")
              break
            case "network":
              console.error("Network error during speech synthesis")
              break
            default:
              console.error("Unknown speech synthesis error:", event.error)
          }
        }

        utterance.onpause = () => {
          console.log("Speech paused")
        }

        utterance.onresume = () => {
          console.log("Speech resumed")
        }

        // Start speaking with error handling
        try {
          window.speechSynthesis.speak(utterance)
        } catch (speakError) {
          console.error("Error starting speech:", speakError)
          setIsSpeaking(false)
        }
      }, 100) // Small delay to ensure cancellation completes
    } catch (error) {
      console.error("Error in speakText:", error)
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    try {
      if (speechSupported && window.speechSynthesis) {
        // Check if speech synthesis is speaking before canceling
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel()
          console.log("Speech stopped")
        }
        setIsSpeaking(false)
      }
    } catch (error) {
      console.error("Error stopping speech:", error)
      setIsSpeaking(false)
    }
  }

  const formatMessage = (content: string) => {
    // Split content into lines and process each line
    const lines = content.split("\n").filter((line) => line.trim() !== "")

    return lines
      .map((line, index) => {
        const trimmedLine = line.trim()

        // Handle main headings (### or ##)
        if (trimmedLine.match(/^#{2,3}\s+(.+)$/)) {
          const headingText = trimmedLine.replace(/^#{2,3}\s+/, "")
          return (
            <div
              key={index}
              className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-6 mb-3 border-b-2 border-blue-300 dark:border-blue-600 pb-2"
            >
              {headingText}
            </div>
          )
        }

        // Handle subheadings (#### or single #)
        if (trimmedLine.match(/^#{1,4}\s+(.+)$/)) {
          const headingText = trimmedLine.replace(/^#{1,4}\s+/, "")
          return (
            <div key={index} className="text-lg font-bold text-blue-700 dark:text-blue-400 mt-4 mb-2">
              {headingText}
            </div>
          )
        }

        // Handle numbered lists (1., 2., 3., etc.)
        if (trimmedLine.match(/^\d+\.\s+(.+)$/)) {
          const match = trimmedLine.match(/^(\d+)\.\s+(.+)$/)
          if (match) {
            const [, number, text] = match
            const formattedText = formatInlineText(text)
            return (
              <div key={index} className="ml-4 mb-2 flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                  {number}
                </span>
                <div
                  className="font-medium text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                />
              </div>
            )
          }
        }

        // Handle bullet points with ** bold text **
        if (trimmedLine.match(/^\*\s+\*\*(.+?)\*\*:\s*(.+)$/)) {
          const match = trimmedLine.match(/^\*\s+\*\*(.+?)\*\*:\s*(.+)$/)
          if (match) {
            const [, boldText, description] = match
            const formattedDescription = formatInlineText(description)
            return (
              <div key={index} className="ml-4 mb-3 flex items-start">
                <span className="text-blue-500 mr-3 mt-1.5 text-lg">•</span>
                <div>
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{boldText}:</span>
                  <span
                    className="ml-2 text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: formattedDescription }}
                  />
                </div>
              </div>
            )
          }
        }

        // Handle regular bullet points with asterisks
        if (trimmedLine.match(/^\*\s+(.+)$/)) {
          const bulletText = trimmedLine.replace(/^\*\s+/, "")
          const formattedText = formatInlineText(bulletText)
          return (
            <div key={index} className="ml-4 mb-2 flex items-start">
              <span className="text-blue-500 mr-3 mt-1.5 text-lg">•</span>
              <div className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: formattedText }} />
            </div>
          )
        }

        // Handle lines that end with colon (like section headers)
        if (trimmedLine.endsWith(":") && trimmedLine.length < 100 && !trimmedLine.includes("**")) {
          return (
            <div key={index} className="font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 text-base">
              {trimmedLine}
            </div>
          )
        }

        // Handle important highlighted text (lines with multiple ** or key phrases)
        if (
          trimmedLine.includes("**") &&
          (trimmedLine.includes("important") || trimmedLine.includes("note") || trimmedLine.includes("remember"))
        ) {
          const formattedText = formatInlineText(trimmedLine)
          return (
            <div
              key={index}
              className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: formattedText }}
            />
          )
        }

        // Handle regular paragraphs
        if (trimmedLine.length > 0) {
          const formattedText = formatInlineText(trimmedLine)
          return (
            <div
              key={index}
              className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: formattedText }}
            />
          )
        }

        return null
      })
      .filter(Boolean)
  }

  // Helper function to format inline text with bold, italic, underline, and highlights
  const formatInlineText = (text: string): string => {
    let formattedText = text

    // Handle bold text (**text**)
    formattedText = formattedText.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>',
    )

    // Handle italic text (*text*)
    formattedText = formattedText.replace(
      /(?<!\*)\*([^*]+?)\*(?!\*)/g,
      '<em class="italic text-gray-800 dark:text-gray-200">$1</em>',
    )

    // Handle underlined text (__text__)
    formattedText = formattedText.replace(/__(.+?)__/g, '<u class="underline decoration-blue-500 decoration-2">$1</u>')

    // Handle highlighted text (==text==)
    formattedText = formattedText.replace(
      /==(.+?)==/g,
      '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>',
    )

    // Handle code text (`text`)
    formattedText = formattedText.replace(
      /`(.+?)`/g,
      '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>',
    )

    // Handle important keywords with special styling
    const importantKeywords = [
      "premium",
      "deductible",
      "coverage",
      "policy",
      "claim",
      "benefit",
      "exclusion",
      "liability",
      "comprehensive",
      "collision",
      "term life",
      "whole life",
      "health insurance",
      "auto insurance",
      "home insurance",
      "travel insurance",
      "disability insurance",
    ]

    importantKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, "gi")
      formattedText = formattedText.replace(
        regex,
        '<span class="font-semibold text-blue-700 dark:text-blue-300">$1</span>',
      )
    })

    return formattedText
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await handleChatCompletion(messages, userMessage, shortChatMode)

      if (language !== "en") {
        setTranslating(true)
        try {
          const translatedResponse = await translateText(response, language)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: translatedResponse,
              originalContent: response,
            },
          ])
        } catch (translationError) {
          console.error("Translation error:", translationError)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: response,
            },
          ])
        } finally {
          setTranslating(false)
        }
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: response }])
      }
    } catch (error) {
      console.error("Error getting chat completion:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage)

    const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")

    if (lastAssistantMessage && lastAssistantMessage.content) {
      const contentToTranslate = lastAssistantMessage.originalContent || lastAssistantMessage.content

      if (contentToTranslate && newLanguage !== "en") {
        setTranslating(true)
        try {
          const translatedContent = await translateText(contentToTranslate, newLanguage)

          setMessages((prev) =>
            prev.map((msg, i) =>
              i === prev.length - 1 && msg.role === "assistant"
                ? { ...msg, content: translatedContent, originalContent: contentToTranslate }
                : msg,
            ),
          )
        } catch (error) {
          console.error("Error translating message:", error)
        } finally {
          setTranslating(false)
        }
      } else if (newLanguage === "en" && lastAssistantMessage.originalContent) {
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === prev.length - 1 && msg.role === "assistant" && msg.originalContent
              ? { ...msg, content: msg.originalContent }
              : msg,
          ),
        )
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Insurance Advisor</span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {shortChatMode ? "💬 Short" : "📝 Detailed"}
                    </span>
                    <button
                      onClick={() => setShortChatMode(!shortChatMode)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        shortChatMode ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300",
                          shortChatMode ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                      <span className="sr-only">
                        {shortChatMode ? "Switch to detailed responses" : "Switch to short responses"}
                      </span>
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{shortChatMode ? "Switch to detailed responses" : "Switch to short, casual responses"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change language</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 max-w-[90%] animate-fade-in",
                  message.role === "user" ? "ml-auto" : "",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Avatar className={cn(message.role === "user" ? "order-2" : "")}>
                  <AvatarFallback className={message.role === "assistant" ? "bg-blue-600 text-white" : "bg-slate-200"}>
                    {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm transition-all duration-200 hover:shadow-md relative group",
                    message.role === "assistant"
                      ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                      : "bg-blue-600 text-white",
                  )}
                >
                  {message.role === "assistant" ? (
                    <>
                      <div className="space-y-1 max-w-none">{formatMessage(message.content)}</div>
                      {message.originalContent && language !== "en" && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="text-xs cursor-pointer"
                                  onClick={() => speakText(message.content)}
                                >
                                  {languages.find((l) => l.code === language)?.name}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Translated from English</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                      {speechSupported && (
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => (isSpeaking ? stopSpeaking() : speakText(message.content))}
                          >
                            {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-white font-medium">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 max-w-[90%] animate-bounce-in">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                  <span>{translating ? "Translating..." : "Thinking..."}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder={`${shortChatMode ? "Quick question" : "Ask about insurance"} in ${languages.find((l) => l.code === language)?.name || "English"}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            {recognitionSupported && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isListening ? "destructive" : "outline"}
                      size="icon"
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={cn(
                        "transition-all duration-200",
                        isListening && "animate-pulse bg-red-500 hover:bg-red-600",
                      )}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? "Listening... Click to stop" : "Click to start voice input"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
