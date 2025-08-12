"use client"

import { useState, useEffect, useRef } from "react"
import { Brain, Users, Target, FileText, Zap, Sparkles, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { processUserAssessment } from "@/services/lyzr-agents"
import type { UserProfile } from "@/types/assessment"

const agents = [
  { name: "Input Handling Agent", icon: FileText },
  { name: "Archetype Profiler Agent", icon: Brain },
  { name: "Role & Team Matcher Agent", icon: Users },
  { name: "Fit Scoring & Recommendation Agent", icon: Target },
  { name: "HR Summary Generator Agent", icon: Zap },
]

export default function ProcessingPage() {
  const [completedAgents, setCompletedAgents] = useState<number[]>([])
  const [currentAgent, setCurrentAgent] = useState(0)
  const [progress, setProgress] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(150) // 2 minutes 30 seconds
  const [apiCompleted, setApiCompleted] = useState(false)
  const [apiResults, setApiResults] = useState(null)
  const apiCalledRef = useRef(false)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Add timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !redirecting) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining, redirecting])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle API completion
  useEffect(() => {
    if (apiCompleted && apiResults && !redirecting) {
      // Clear any existing progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      // Show 100% progress
      setProgress(100)
      setCompletedAgents(Array.from({ length: agents.length }, (_, idx) => idx))

      // Wait a moment to show 100%, then redirect
      setTimeout(() => {
        localStorage.setItem("assessmentResults", JSON.stringify(apiResults))
        setRedirecting(true)
        setTimeout(() => {
          router.push("/assessment/results")
        }, 1500)
      }, 1000)
    }
  }, [apiCompleted, apiResults, redirecting, router])

  useEffect(() => {
    const processAssessment = async () => {
      try {
        const savedProfile = localStorage.getItem("userProfile")

        if (!savedProfile) {
          router.push("/assessment")
          return
        }

        const userProfile: UserProfile = JSON.parse(savedProfile)

        // Ensure API is only called once
        if (apiCalledRef.current) {
          return
        }
        apiCalledRef.current = true

        console.log("🚀 Starting agent processing...")

        // Start the actual API call in background
        processUserAssessment({
          name: userProfile.name,
          email: userProfile.email,
          responses: userProfile.responses,
        })
          .then((results) => {
            console.log("🎉 API completed successfully")
            setApiCompleted(true)
            setApiResults(results)
          })
          .catch((error) => {
            console.error("❌ Agent processing failed:", error)
            setError("Failed to process assessment. Please try again.")
          })

        // Start extremely slow progress - 1% every 3 seconds
        let currentProgress = 1

        progressIntervalRef.current = setInterval(() => {
          if (apiCompleted) {
            // API finished, clear interval
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
              progressIntervalRef.current = null
            }
            return
          }

          if (currentProgress < 95) {
            currentProgress = Math.min(currentProgress + 1, 95)
            setProgress(currentProgress)

            // Update current agent and completed agents based on progress
            const agentIndex = Math.floor((currentProgress / 100) * agents.length)
            setCurrentAgent(Math.min(agentIndex, agents.length - 1))

            // Mark agents as completed
            const completedCount = Math.floor((currentProgress / 100) * agents.length)
            setCompletedAgents(Array.from({ length: completedCount }, (_, idx) => idx))
          }
        }, 3000) // 3 seconds per 1%
      } catch (error) {
        console.error("Error in processAssessment:", error)
        setError("Failed to process assessment. Please try again.")
      }
    }

    processAssessment()

    // Cleanup on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [router]) // Only depend on router

  const getAgentStatus = (index: number) => {
    if (completedAgents.includes(index)) return "complete"
    if (index === currentAgent) return "active"
    return "pending"
  }

  const getStatusText = () => {
    if (redirecting) return "🎉 Analysis complete! Preparing your results"
    if (currentAgent === 0) return "🔍 Processing your responses"
    if (currentAgent === 1) return "🧠 Profiling your archetype"
    if (currentAgent === 2) return "👥 Matching ideal roles and teams"
    if (currentAgent === 3) return "🎯 Calculating fit scores"
    if (currentAgent === 4) return "📋 Generating HR summary"
    return "✨ Finalizing your results"
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Processing Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/assessment")}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-black/5 to-transparent rounded-full animate-spin"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-black/10 to-transparent rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gray-200 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto p-6">
        {/* Lyzr Branding */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="bg-black p-2 rounded-lg">
            <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-8 w-auto" />
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>Powered by Lyzr AI Technology</span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-black">
          {redirecting ? "Complete! Redirecting" : "Calibrating your Culture Fit Assessment"}
        </h1>

        {/* Progress Circle with Timer */}
        <div className="flex items-center justify-center space-x-8 mb-12">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="6" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={progress >= 100 ? "#10b981" : "black"}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                className="transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={`text-3xl font-bold ${progress >= 100 ? "text-green-600" : "text-black"}`}>
                  {Math.round(progress)}%
                </span>
                <div className="text-xs text-gray-500 mt-1">{progress >= 100 ? "Complete" : "Processing"}</div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatTime(timeRemaining)}</div>
            <div className="text-sm text-gray-500">Estimated time remaining</div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="space-y-4 mb-8">
          {agents.map((agent, index) => {
            const status = getAgentStatus(index)
            const Icon = agent.icon

            return (
              <div
                key={agent.name}
                className={`flex items-center justify-center space-x-4 p-4 rounded-2xl transition-all duration-500 ${
                  status === "active"
                    ? "bg-black text-white border-2 border-black scale-105 shadow-2xl"
                    : status === "complete"
                      ? "bg-green-50 border-2 border-green-200 text-green-800"
                      : "bg-gray-50 border-2 border-gray-200 text-gray-600"
                }`}
              >
                <div
                  className={`p-3 rounded-full ${
                    status === "active"
                      ? "bg-white/20 animate-pulse"
                      : status === "complete"
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      status === "active" ? "text-white" : status === "complete" ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>
                <span className="font-semibold flex-1 text-left">{agent.name}</span>
                {status === "active" && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                  </div>
                )}
                {status === "complete" && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
            )
          })}
        </div>

        {/* Status Line */}
        <div className="text-gray-600 text-lg font-medium">{getStatusText()}</div>
      </div>
    </div>
  )
}
