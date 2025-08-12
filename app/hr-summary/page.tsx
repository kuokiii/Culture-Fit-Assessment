"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Download, Sparkles } from 'lucide-react'
import Link from "next/link"

interface AssessmentResults {
  inputHandling: { response: string; session_id: string }
  archetype: { response: string; session_id: string }
  roleMatches: { response: string; session_id: string }
  fitScoring: { response: string; session_id: string }
  hrSummary: { response: string; session_id: string }
}

export default function HRSummaryPage() {
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedResults = localStorage.getItem("assessmentResults")
    if (savedResults) {
      setResults(JSON.parse(savedResults))
    }
    setLoading(false)
  }, [])

  const handleCopy = () => {
    if (results?.hrSummary.response) {
      navigator.clipboard.writeText(results.hrSummary.response)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-black to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading HR summary...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Assessment Data Found</h1>
          <Link href="/assessment">
            <Button>Take Assessment</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Header */}
      <header className="p-6 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link
            href="/assessment/results"
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Results</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="bg-black p-2 rounded-lg">
              <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-6 w-auto" />
            </div>
            <div className="text-xs text-gray-500">HR Summary</div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Report
            </Button>
            <Button className="bg-black text-white hover:bg-gray-800 shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HR Summary */}
          <Card className="p-8 bg-white border-2 border-gray-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-black">Professional HR Summary</h2>
              <Badge className="bg-green-50 text-green-700 border-2 border-green-200 px-4 py-2 font-semibold">
                ✅ AI Generated
              </Badge>
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {results.hrSummary.response}
            </div>
          </Card>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-white border-2 border-gray-100 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Archetype Analysis</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{results.archetype.response}</div>
            </Card>

            <Card className="p-6 bg-white border-2 border-gray-100 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Fit Scoring Details</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{results.fitScoring.response}</div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-black p-2 rounded-lg">
              <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-6 w-auto" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Technology</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Confidential HR Assessment • Generated on {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">© 2025 Culture Fit Assessment. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
