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

// Language options
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
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

      // Configure recognition settings
      recognitionRef.current.continuous = false // Changed to false for better control
      recognitionRef.current.interimResults = true
      recognitionRef.current.maxAlternatives = 1

      // Set language based on current selection
      recognitionRef.current.lang = getLanguageCode(language)

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

        // Update input with final transcript or show interim results
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

        // Handle different error types
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

      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        console.log("Available voices:", voices.length)
      }

      // Load voices when they become available
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
      loadVoices()
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, []) // Remove language dependency to avoid recreation

  // Add effect to update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguageCode(language)
    }
  }, [language])

  // Add helper function to get proper language codes for speech recognition
  const getLanguageCode = (lang: string): string => {
    const speechLanguageCodes: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      zh: "zh-CN",
      ja: "ja-JP",
      ar: "ar-SA",
      hi: "hi-IN",
      ru: "ru-RU",
      pt: "pt-BR",
    }
    return speechLanguageCodes[lang] || "en-US"
  }

  // Update the toggleListening function
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
        // Clear any existing input
        setInput("")

        // Set the language before starting
        if (recognitionRef.current) {
          recognitionRef.current.lang = getLanguageCode(language)
          recognitionRef.current.start()
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)

        // Show user-friendly error message
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

  // Update the speakText function with better error handling
  const speakText = (text: string) => {
    if (!speechSupported || !speechSynthesisRef.current) {
      console.error("Speech synthesis not supported")
      return
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Clean text for better speech
      const cleanText = text
        .replace(/<[^>]*>/g, "")
        .replace(/\n+/g, " ")
        .trim()

      if (!cleanText) {
        console.log("No text to speak")
        return
      }

      // Set up the utterance
      speechSynthesisRef.current.text = cleanText
      speechSynthesisRef.current.rate = 0.9
      speechSynthesisRef.current.pitch = 1
      speechSynthesisRef.current.volume = 1

      // Find appropriate voice for the selected language
      const voices = window.speechSynthesis.getVoices()
      const languageCode = getLanguageCode(language)
      const languageVoice = voices.find(
        (voice) => voice.lang.startsWith(languageCode.split("-")[0]) || voice.lang === languageCode,
      )

      if (languageVoice) {
        speechSynthesisRef.current.voice = languageVoice
        console.log("Using voice:", languageVoice.name)
      } else {
        console.log("No specific voice found for language, using default")
      }

      // Set language
      speechSynthesisRef.current.lang = languageCode

      // Event handlers
      speechSynthesisRef.current.onstart = () => {
        setIsSpeaking(true)
        console.log("Speech started")
      }

      speechSynthesisRef.current.onend = () => {
        setIsSpeaking(false)
        console.log("Speech ended")
      }

      speechSynthesisRef.current.onerror = (event) => {
        setIsSpeaking(false)
        console.error("Speech synthesis error:", event.error)
      }

      // Start speaking
      window.speechSynthesis.speak(speechSynthesisRef.current)
    } catch (error) {
      console.error("Error in speakText:", error)
      setIsSpeaking(false)
    }
  }

  // Update the stopSpeaking function
  const stopSpeaking = () => {
    try {
      if (speechSupported && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        console.log("Speech stopped")
      }
    } catch (error) {
      console.error("Error stopping speech:", error)
      setIsSpeaking(false)
    }
  }

  const formatMessage = (content: string) => {
    // Split content into lines
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
              className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-4 mb-2 border-b border-blue-200 dark:border-blue-700 pb-1"
            >
              {headingText}
            </div>
          )
        }

        // Handle subheadings (#### or single #)
        if (trimmedLine.match(/^#{1,4}\s+(.+)$/)) {
          const headingText = trimmedLine.replace(/^#{1,4}\s+/, "")
          return (
            <div key={index} className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-3 mb-1">
              {headingText}
            </div>
          )
        }

        // Handle bullet points with ** bold text **
        if (trimmedLine.match(/^\*\s+\*\*(.+?)\*\*:\s*(.+)$/)) {
          const match = trimmedLine.match(/^\*\s+\*\*(.+?)\*\*:\s*(.+)$/)
          if (match) {
            const [, boldText, description] = match
            return (
              <div key={index} className="ml-4 mb-2 flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{boldText}:</span>
                  <span className="ml-1">{description}</span>
                </div>
              </div>
            )
          }
        }

        // Handle regular bullet points with asterisks
        if (trimmedLine.match(/^\*\s+(.+)$/)) {
          const bulletText = trimmedLine.replace(/^\*\s+/, "")
          // Remove any remaining ** formatting
          const cleanText = bulletText.replace(/\*\*(.+?)\*\*/g, "$1")
          return (
            <div key={index} className="ml-4 mb-1 flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <span>{cleanText}</span>
            </div>
          )
        }

        // Handle numbered lists
        if (trimmedLine.match(/^\d+\.\s+(.+)$/)) {
          const listText = trimmedLine.replace(/^\d+\.\s+/, "")
          const cleanText = listText.replace(/\*\*(.+?)\*\*/g, "$1")
          return (
            <div key={index} className="ml-4 mb-1 font-medium">
              <span className="text-blue-600 mr-2">{trimmedLine.match(/^\d+/)?.[0]}.</span>
              {cleanText}
            </div>
          )
        }

        // Handle lines that end with colon (like section headers)
        if (trimmedLine.endsWith(":") && trimmedLine.length < 100) {
          return (
            <div key={index} className="font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1">
              {trimmedLine}
            </div>
          )
        }

        // Handle regular paragraphs - remove ** formatting
        if (trimmedLine.length > 0) {
          // Remove bold markdown formatting
          let cleanText = trimmedLine.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          // Remove italic formatting
          cleanText = cleanText.replace(/\*(.+?)\*/g, "<em>$1</em>")

          return (
            <div
              key={index}
              className="mb-2 leading-relaxed text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: cleanText }}
            />
          )
        }

        return null
      })
      .filter(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get response in English first
      const response = await handleChatCompletion(messages, userMessage)

      // If language is not English, translate the response
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

    // If we have messages and changing language, translate the last assistant message
    const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")

    if (lastAssistantMessage && lastAssistantMessage.content) {
      // Use original English content if available, otherwise use current content
      const contentToTranslate = lastAssistantMessage.originalContent || lastAssistantMessage.content

      // Only translate if not already in English and we're not switching to English
      if (contentToTranslate && newLanguage !== "en") {
        setTranslating(true)
        try {
          const translatedContent = await translateText(contentToTranslate, newLanguage)

          // Update the last assistant message with the translated content
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
        // If switching to English and we have the original content, use it
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
        <div className="p-3 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Insurance Advisor</span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[110px] h-8">
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
                                  {languages.find((l) => l.code === language)?.name || language}
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
                    <div className="text-white">{message.content}</div>
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
              placeholder={`Ask about insurance in ${languages.find((l) => l.code === language)?.name || "English"}...`}
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
