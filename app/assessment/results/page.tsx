"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Sparkles, Calendar, ArrowRight, User, ExternalLink, Briefcase, Mail } from "lucide-react"
import type { UserProfile } from "@/types/assessment"
import { parseMarkdownToReact } from "@/utils/markdown-parser"
import { searchJobsWithPerplexity } from "@/services/perplexity-jobs"
import { splitIntoColoredSections } from "@/utils/markdown-parser"
import { sendAssessmentReport, generateEmailHTML, generateComprehensivePDF } from "@/services/email"

interface AssessmentResults {
  inputHandling: { response: string; session_id: string }
  archetype: { response: string; session_id: string }
  roleMatches: { response: string; session_id: string }
  fitScoring: { response: string; session_id: string }
  hrSummary: { response: string; session_id: string }
}

interface JobListing {
  title: string
  company: string
  location: string
  description: string
  link: string
  salary?: string
  type?: string
  companyLogo?: string
  matchPercentage?: number
  culturalFit?: number
  roleMatch?: number
  teamDynamics?: number
  growthPotential?: number
}

const sections = [
  { id: "jobs", title: "Available Jobs", number: "1" },
  { id: "archetype", title: "Culture Archetype", number: "2" },
  { id: "roles", title: "Role & Team Matches", number: "3" },
  { id: "scoring", title: "Compatibility Analysis", number: "4" },
  { id: "summary", title: "Professional Summary", number: "5" },
]

export default function AssessmentResultsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState("jobs")
  const [extractedArchetype, setExtractedArchetype] = useState<string>("Professional Archetype")
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  // Extract archetype name from AI response
  const extractArchetypeName = (archetypeResponse: string): string => {
    // Clean the response first
    const cleanResponse = archetypeResponse.replace(/<[^>]*>/g, "").replace(/\*\*/g, "")

    // More precise patterns for archetype extraction
    const patterns = [
      // Pattern 1: "Your archetype is [NAME]" or "The archetype is [NAME]"
      /(?:your|the)\s+(?:workplace\s+)?archetype\s+is[:\s]+([A-Z][a-zA-Z\s]{5,35})(?:\s*[.!,]|\s+(?:reflecting|which|that|and|with|in|for|based))/i,

      // Pattern 2: "You are a/an [NAME]"
      /you\s+are\s+(?:a|an)\s+([A-Z][a-zA-Z\s]{5,35})(?:\s*[.!,]|\s+(?:who|that|which|with|reflecting|focused))/i,

      // Pattern 3: Direct archetype mention at start of sentence
      /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})(?:\s+is|\s+are|\s+reflects|\s+represents|\s*[.!,])/m,

      // Pattern 4: "archetype: [NAME]" or "Profile: [NAME]"
      /(?:archetype|profile)[:\s]+([A-Z][a-zA-Z\s]{5,35})(?:\s*[.!,]|\s+(?:reflecting|which|that))/i,

      // Pattern 5: Look for capitalized phrases that are likely archetype names
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b(?=\s+(?:archetype|profile|type|persona|character))/i,
    ]

    for (const pattern of patterns) {
      const match = cleanResponse.match(pattern)
      if (match && match[1]) {
        let extracted = match[1].trim()

        // Clean up common trailing words
        extracted = extracted.replace(
          /\s+(?:reflecting|focused|oriented|driven|based|type|archetype|profile|persona|character|who|that|which|with|and|or|is|are).*$/i,
          "",
        )

        // Ensure it's a reasonable length and format
        if (
          extracted.length >= 5 &&
          extracted.length <= 40 &&
          !extracted.match(/^(the|this|your|analysis|assessment|workplace|work|job|role|career)$/i) &&
          extracted.match(/^[A-Z][a-zA-Z\s]+$/)
        ) {
          return extracted.trim()
        }
      }
    }

    // Fallback: look for any capitalized two-word phrase that looks like an archetype
    const fallbackMatch = cleanResponse.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/)
    if (fallbackMatch && fallbackMatch[1]) {
      const potential = fallbackMatch[1].trim()
      if (
        potential.length > 8 &&
        potential.length < 30 &&
        !potential.match(
          /^(Software Developer|Data Analyst|Project Manager|Business Analyst|Your Workplace|The Assessment|AI Technology)$/i,
        )
      ) {
        return potential
      }
    }

    return "Professional Archetype"
  }

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Progress animation
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              return 100
            }
            return prev + Math.random() * 8 + 2
          })
        }, 300)

        // Get user profile and results from localStorage
        const savedProfile = localStorage.getItem("userProfile")
        const savedResults = localStorage.getItem("assessmentResults")

        if (!savedProfile || !savedResults) {
          throw new Error("No assessment data found")
        }

        const profile: UserProfile = JSON.parse(savedProfile)
        const assessmentResults: AssessmentResults = JSON.parse(savedResults)

        setUserProfile(profile)
        setResults(assessmentResults)

        // Extract archetype name
        const archetype = extractArchetypeName(assessmentResults.archetype.response)
        setExtractedArchetype(archetype)

        setTimeout(() => {
          clearInterval(progressInterval)
          setLoadingProgress(100)
          setTimeout(() => {
            setLoading(false)
            // Load jobs after main content is loaded
            loadJobs(archetype, profile.jobRole, profile.location)
          }, 800)
        }, 2000)
      } catch (error) {
        console.error("Error loading results:", error)
        setError("Failed to load assessment results")
        setLoading(false)
      }
    }

    loadResults()
  }, [])

  const loadJobs = async (archetype: string, jobRole: string, location: string) => {
    setJobsLoading(true)
    try {
      const jobs = await searchJobsWithPerplexity(archetype, jobRole, location)
      setJobListings(jobs)
    } catch (error) {
      console.error("Error loading jobs:", error)
    } finally {
      setJobsLoading(false)
    }
  }

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = sectionRefs.current[section.id]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleBookDemo = () => {
    window.open("https://hubs.ly/Q03yHHL_0", "_blank")
  }

  const handleLearnMore = () => {
    window.open("https://lyzr.ai", "_blank")
  }

  const handlePrintReport = () => {
    if (!userProfile || !results) return

    // Create a new window with the report content
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Enhanced markdown to HTML conversion with better table handling
    const convertMarkdownToHtml = (markdown: string): string => {
      let html = markdown

      // Clean up <BOLD> tags completely first
      html = html.replace(/<\/?BOLD>/g, "")
      html = html.replace(/<BOLD>\s*(.*?)\s*<\/BOLD>/g, "**$1**")

      // Convert headers
      html = html.replace(
        /### (.*)/g,
        '<h3 style="font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: #000;">$1</h3>',
      )
      html = html.replace(
        /## (.*)/g,
        '<h2 style="font-size: 22px; font-weight: bold; margin: 25px 0 15px 0; color: #000;">$1</h2>',
      )
      html = html.replace(
        /# (.*)/g,
        '<h1 style="font-size: 26px; font-weight: bold; margin: 30px 0 20px 0; color: #000;">$1</h1>',
      )

      // Convert bold and italic
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #000;">$1</strong>')
      html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      html = html.replace(
        /`(.*?)`/g,
        '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>',
      )

      // Enhanced table conversion
      const lines = html.split("\n")
      let inTable = false
      let tableHtml = ""
      const processedLines: string[] = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Skip lines with only dashes or empty content
        if (!line || line.match(/^[-\s|]*$/) || line === "##") {
          if (!inTable) processedLines.push(line)
          continue
        }

        // Check if this line starts a table
        if (line.includes("|") && line.split("|").length >= 3) {
          const cells = line
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell && !cell.match(/^[-\s]*$/))

          if (cells.length === 0) {
            continue // Skip empty table rows
          }

          if (!inTable) {
            // Start of table
            inTable = true

            // Check if next line is separator
            const nextLine = lines[i + 1]?.trim()
            const isSeparator = nextLine && nextLine.includes("|") && nextLine.includes("-")

            if (isSeparator) {
              // This is a header row
              tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #000;">
                <thead>
                  <tr style="background: #f8f9fa; border-bottom: 2px solid #000;">
                    ${cells.map((cell) => `<th style="border: 1px solid #000; padding: 12px; text-align: left; font-weight: bold;">${cell}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>`
              i++ // Skip separator line
            } else {
              // Regular table row
              tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #000;">
                <tbody>
                  <tr>
                    ${cells.map((cell) => `<td style="border: 1px solid #000; padding: 12px;">${cell}</td>`).join("")}
                  </tr>`
            }
          } else {
            // Continue table
            tableHtml += `<tr>
              ${cells.map((cell) => `<td style="border: 1px solid #000; padding: 12px;">${cell}</td>`).join("")}
            </tr>`
          }
        } else if (inTable && line === "") {
          // End of table
          tableHtml += "</tbody></table>"
          processedLines.push(tableHtml)
          inTable = false
          tableHtml = ""
        } else if (!inTable) {
          processedLines.push(line)
        }
      }

      // Close any remaining table
      if (inTable) {
        tableHtml += "</tbody></table>"
        processedLines.push(tableHtml)
      }

      html = processedLines.join("\n")

      // Convert lists
      html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin-bottom: 8px;">$1</li>')
      html = html.replace(/(<li.*?<\/li>)/gs, '<ul style="margin: 15px 0; padding-left: 25px;">$1</ul>')

      // Convert numbered lists
      html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin-bottom: 8px;">$1</li>')

      // Convert paragraphs
      html = html.replace(/\n\n/g, '</p><p style="margin-bottom: 15px; line-height: 1.6;">')
      html = html.replace(/\n/g, "<br>")

      // Wrap in paragraph tags
      html = '<p style="margin-bottom: 15px; line-height: 1.6;">' + html + "</p>"

      return html
    }

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Culture Fit Assessment - ${userProfile.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000;
            }
            .candidate-info {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 30px;
              border: 2px solid #e9ecef;
            }
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
              border-bottom: 2px solid #e9ecef;
              padding-bottom: 30px;
            }
            .section:last-child {
              border-bottom: none;
            }
            .section-title {
              font-size: 24px;
              font-weight: bold;
              color: #000;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .content {
              line-height: 1.8;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 20px 0 !important;
              border: 2px solid #000 !important;
            }
            th, td {
              border: 1px solid #000 !important;
              padding: 12px !important;
              text-align: left !important;
            }
            th {
              background: #f8f9fa !important;
              font-weight: bold !important;
              border-bottom: 2px solid #000 !important;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 2px solid #000;
              padding-top: 20px;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CULTURE FIT ASSESSMENT</div>
            <div style="font-size: 16px; color: #666;">AI-Powered Career Intelligence Platform</div>
          </div>
          
          <div class="candidate-info">
            <h2 style="margin-top: 0; color: #000;">Candidate Information</h2>
            <p><strong>Name:</strong> ${userProfile.name}</p>
            <p><strong>Email:</strong> ${userProfile.email}</p>
            <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Target Role:</strong> ${userProfile.jobRole}</p>
            <p><strong>Archetype:</strong> ${extractedArchetype}</p>
          </div>

          <div class="section">
            <div class="section-title">Culture Archetype Analysis</div>
            <div class="content">
              ${convertMarkdownToHtml(results.archetype.response)}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Role & Team Matches</div>
            <div class="content">
              ${convertMarkdownToHtml(results.roleMatches.response)}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Compatibility Analysis</div>
            <div class="content">
              ${convertMarkdownToHtml(results.fitScoring.response)}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Professional HR Summary</div>
            <div class="content">
              ${convertMarkdownToHtml(results.hrSummary.response)}
            </div>
          </div>

          <div class="footer">
            <p><strong>Generated by Lyzr AI Technology</strong></p>
            <p>© 2025 Lyzrithm. All rights reserved.</p>
            <p>This report is confidential and intended solely for the named candidate and authorized personnel.</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(reportContent)
    printWindow.document.close()

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const handleSendEmail = async () => {
    if (!userProfile || !results) return

    setEmailSending(true)
    try {
      const emailHTML = generateEmailHTML(
        userProfile.name,
        extractedArchetype,
        {
          archetype: results.archetype.response,
          roleMatches: results.roleMatches.response,
          fitScoring: results.fitScoring.response,
          hrSummary: results.hrSummary.response,
        },
        jobListings,
      )

      // Generate comprehensive PDF content for attachment
      const pdfContent = generateComprehensivePDF(
        userProfile.name,
        extractedArchetype,
        {
          archetype: results.archetype.response,
          roleMatches: results.roleMatches.response,
          fitScoring: results.fitScoring.response,
          hrSummary: results.hrSummary.response,
        },
        jobListings,
      )

      await sendAssessmentReport({
        to: userProfile.email,
        name: userProfile.name,
        subject: `Your Culture Fit Assessment Report - ${extractedArchetype}`,
        htmlContent: emailHTML,
        jobListings: jobListings,
        pdfAttachment: pdfContent,
      })

      alert("Report sent successfully with comprehensive PDF attachment!")
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Failed to send email. Please try again.")
    } finally {
      setEmailSending(false)
    }
  }

  // Circular progress component
  const CircularProgress = ({
    value,
    size = 60,
    strokeWidth = 6,
    label,
    color = "#059669",
  }: {
    value: number
    size?: number
    strokeWidth?: number
    label: string
    color?: string
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-2">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm font-bold text-gray-900">{value}%</div>
          </div>
        </div>
        <div className="text-xs text-gray-600 text-center">{label}</div>
      </div>
    )
  }

  const renderContentWithBoundaries = (content: string) => {
    const sections = splitIntoColoredSections(content)

    if (sections.length === 0) {
      return (
        <div className="pl-6 py-4 border-l-4 border-l-gray-400 bg-gray-50 mb-4">
          <div className="text-gray-500 italic">Content is being processed by our AI agents...</div>
        </div>
      )
    }

    const colors = [
      "border-l-blue-500 bg-blue-50",
      "border-l-green-500 bg-green-50",
      "border-l-purple-500 bg-purple-50",
      "border-l-orange-500 bg-orange-50",
      "border-l-pink-500 bg-pink-50",
    ]

    return sections
      .map((section, index) => {
        const sectionContent = parseMarkdownToReact(section.trim())

        if (!sectionContent || sectionContent.length === 0) {
          return null
        }

        return (
          <div key={index} className={`pl-6 py-4 border-l-4 ${colors[index % 5]} mb-4 last:mb-0`}>
            <div className="text-gray-700 leading-relaxed">{sectionContent}</div>
          </div>
        )
      })
      .filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <img
              src="/images/lyzr-logo.png"
              alt="Lyzr Logo"
              className="h-6 w-auto brightness-0 invert"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <p className="text-gray-600 text-lg font-medium mb-6">Loading your results...</p>
          <div className="max-w-xs mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gray-800 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{Math.round(loadingProgress)}% Complete</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userProfile || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Results</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => (window.location.href = "/assessment")}>Take Assessment Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 text-gray-900">
      {/* Header */}
      <header className="p-6 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-black p-3 rounded-lg shadow-lg">
              <img
                src="/images/lyzr-logo.png"
                alt="Lyzr Logo"
                className="h-6 w-auto brightness-0 invert"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div className="text-xs text-gray-500">Assessment Results</div>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleSendEmail}
              className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white text-lg px-8 py-6 rounded-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              size="lg"
              onClick={handleBookDemo}
              className="bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black text-lg px-8 py-6 rounded-full"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Demo with Lyzr
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintReport}
              className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white text-lg px-8 py-6 rounded-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </header>

      <div className="flex max-w-8xl mx-auto">
        {/* Main Content Area - Adjust for larger sidebar */}
        <main className="flex-1 p-8 pr-4 max-w-5xl">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-50 border-2 border-green-200 text-green-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Sparkles className="w-5 h-5" />
              <span>Assessment Complete!</span>
            </div>

            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-3xl p-12 text-white mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <p className="text-xl mb-4 opacity-90">Your workplace archetype is:</p>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">{extractedArchetype}</h1>
                <p className="text-xl opacity-90 max-w-2xl">
                  Based on your responses, our AI agents have created a comprehensive analysis of your work style and
                  preferences.
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed">
              Hello <strong>{userProfile.name}</strong>! Our AI agents have analyzed your responses and created a
              detailed profile of your workplace preferences, ideal roles, and cultural fit. Explore each section below
              to discover insights about your professional DNA.
            </p>
          </div>

          {/* Section 1: Available Jobs */}
          <section ref={(el) => (sectionRefs.current["jobs"] = el)} id="jobs" className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                1
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Available Jobs</h2>
            </div>

            <Card className="p-8 bg-white border-2 border-gray-200 shadow-lg">
              {jobsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-600">Searching for jobs that match your archetype...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                      Found <strong>{jobListings.length}</strong> jobs matching your{" "}
                      <strong>{extractedArchetype}</strong> profile
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Powered by Perplexity AI
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {jobListings.map((job, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {job.companyLogo ? (
                                <img
                                  src={job.companyLogo || "/placeholder.svg"}
                                  alt={`${job.company} logo`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = `https://via.placeholder.com/48x48/6B7280/FFFFFF?text=${job.company.charAt(0)}`
                                  }}
                                />
                              ) : (
                                <span className="text-gray-600 font-semibold text-lg">{job.company.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                              <p className="text-gray-600 font-medium">{job.company}</p>
                              <p className="text-sm text-gray-500">{job.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">{job.matchPercentage || 85}%</div>
                            <div className="text-sm text-gray-500">Match</div>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">{job.description}</p>

                        {/* Performance Metrics with Circles */}
                        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          <CircularProgress
                            value={job.culturalFit || Math.floor(Math.random() * 20) + 75}
                            label="Cultural Fit"
                            color="#059669"
                          />
                          <CircularProgress
                            value={job.roleMatch || Math.floor(Math.random() * 15) + 80}
                            label="Role Match"
                            color="#3B82F6"
                          />
                          <CircularProgress
                            value={job.teamDynamics || Math.floor(Math.random() * 25) + 70}
                            label="Team Dynamics"
                            color="#8B5CF6"
                          />
                          <CircularProgress
                            value={job.growthPotential || Math.floor(Math.random() * 20) + 75}
                            label="Growth Potential"
                            color="#F59E0B"
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => window.open(job.link, "_blank")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Apply Now
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </section>

          {/* Section 2: Culture Archetype */}
          <section ref={(el) => (sectionRefs.current["archetype"] = el)} id="archetype" className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                2
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Culture Archetype</h2>
            </div>

            <Card className="p-8 bg-white border-2 border-gray-200 shadow-lg">
              <div className="space-y-4">{renderContentWithBoundaries(results.archetype.response)}</div>
            </Card>
          </section>

          {/* Section 3: Role & Team Matches */}
          <section ref={(el) => (sectionRefs.current["roles"] = el)} id="roles" className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                3
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Role & Team Matches</h2>
            </div>

            <Card className="p-8 bg-white border-2 border-gray-200 shadow-lg">
              <div className="space-y-4">{renderContentWithBoundaries(results.roleMatches.response)}</div>
            </Card>
          </section>

          {/* Section 4: Compatibility Analysis */}
          <section ref={(el) => (sectionRefs.current["scoring"] = el)} id="scoring" className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                4
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Compatibility Analysis</h2>
            </div>

            <Card className="p-8 bg-white border-2 border-gray-200 shadow-lg">
              <div className="space-y-4">{renderContentWithBoundaries(results.fitScoring.response)}</div>
            </Card>
          </section>

          {/* Section 5: Professional Summary */}
          <section ref={(el) => (sectionRefs.current["summary"] = el)} id="summary" className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-black to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                5
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Professional Summary</h2>
            </div>

            <Card className="p-8 bg-white border-2 border-gray-200 shadow-lg">
              <div className="space-y-4">{renderContentWithBoundaries(results.hrSummary.response)}</div>
            </Card>
          </section>

          {/* Action Buttons Section */}
          <section className="py-12">
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  onClick={handleSendEmail}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 text-lg px-8 py-6 rounded-full shadow-lg"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Send Email Report
                </Button>
                <Button
                  onClick={handlePrintReport}
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white text-lg px-8 py-6 rounded-full shadow-lg"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Download PDF Report
                </Button>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16">
            <Card className="p-12 bg-gradient-to-br from-black via-gray-900 to-black text-white border-0 shadow-2xl">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm mb-8 border border-white/20">
                  <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-5 w-auto" />
                  <span>Powered by Lyzr AI Technology</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-6">Want to build this for your organization?</h3>
                <p className="text-gray-200 mb-10 text-lg leading-relaxed">
                  Create custom culture assessments, employee-role matchers, and AI-powered hiring tools for your
                  company using Lyzr's platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button
                    size="lg"
                    onClick={handleBookDemo}
                    className="bg-white text-black hover:bg-gray-200 shadow-lg text-lg px-8 py-6 rounded-full"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a Demo with Lyzr
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleLearnMore}
                    className="border-2 border-white/30 text-white hover:bg-white hover:text-black bg-transparent text-lg px-8 py-6 rounded-full transition-all duration-300"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/20">
                  <p className="text-gray-400 text-sm">
                    Join 500+ companies using Lyzr to revolutionize their hiring process
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </main>

        {/* Right Sidebar - Make it bigger */}
        <aside className="w-96 p-8 pl-4">
          <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Profile Card */}
            <Card className="p-8 bg-white border-2 border-gray-200 shadow-lg mb-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Your workplace archetype is:</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{extractedArchetype}</h3>
                  <p className="text-sm text-gray-600 font-medium">LYZR-AI</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500 mb-4 font-medium">ON THIS PAGE</p>
                <nav className="space-y-3 max-h-64 overflow-y-auto">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center w-full text-left p-3 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-gray-100 text-gray-900 border-l-4 border-gray-800"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="mr-4 font-semibold text-lg">{section.number}.</span>
                      <span className="font-medium">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-8 space-y-4">
                <Button
                  onClick={handleSendEmail}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 py-4 text-lg"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Send Email Report
                </Button>
                <Button
                  onClick={handlePrintReport}
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white py-4 text-lg"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Download PDF Report
                </Button>
              </div>
            </Card>

            {/* Lyzr Branding */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-2">
                <div className="bg-black p-2 rounded-md">
                  <img
                    src="/images/lyzr-logo.png"
                    alt="Lyzr Logo"
                    className="h-2 w-auto brightness-0 invert"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
                <span>Powered by Lyzr AI Technology</span>
              </div>
              <p className="text-xs text-gray-400">© 2025 Lyzrithm. All rights reserved.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
