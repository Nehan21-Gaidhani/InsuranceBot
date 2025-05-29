"use client"

import { useState } from "react"
import { Chat } from "@/components/chat"
import { ProfileBuilder } from "@/components/profile-builder"
import { Analytics } from "@/components/analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MoveRight, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("chat")

  return (
    <main className="flex min-h-screen flex-col transition-colors duration-300">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4 sm:px-8">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
              <span className="text-white font-bold">IA</span>
            </div>
            <span>InsuranceAdvisor</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
            <a href="#" className="text-sm font-medium hover:underline transition-all duration-200">
              Home
            </a>
            <a href="#" className="text-sm font-medium hover:underline transition-all duration-200">
              About
            </a>
            <a href="#" className="text-sm font-medium hover:underline transition-all duration-200">
              Contact
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="transition-all duration-200 hover:scale-110"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container px-4 py-6 sm:px-8 sm:py-12 flex-1 flex flex-col">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your AI Insurance Assistant
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get personalized insurance advice, compare policies, understand complex terms, and manage your coverage with
            our AI-powered assistant.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 mb-8 transition-all duration-300">
            <TabsTrigger value="chat" className="transition-all duration-200 hover:scale-105">
              Chat Assistant
            </TabsTrigger>
            <TabsTrigger value="profile" className="transition-all duration-200 hover:scale-105">
              Profile Builder
            </TabsTrigger>
            <TabsTrigger value="analytics" className="transition-all duration-200 hover:scale-105">
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col">
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 animate-slide-in">
              <Chat />
            </TabsContent>

            <TabsContent value="profile" className="mt-0 animate-slide-in">
              <ProfileBuilder />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0 animate-slide-in">
              <Analytics />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-6 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="animate-fade-in">
              <h3 className="font-semibold mb-3">InsuranceAdvisor</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered insurance assistance to help you make informed decisions about your coverage.
              </p>
            </div>
            <div className="animate-fade-in">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="animate-fade-in">
              <h3 className="font-semibold mb-3">Newsletter</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <Button className="transition-all duration-200 hover:scale-105">
                  <MoveRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} InsuranceAdvisor. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
