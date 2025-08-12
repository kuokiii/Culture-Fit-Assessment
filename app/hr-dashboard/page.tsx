"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Download,
  Search,
  TrendingUp,
  FileText,
  Eye,
  Target,
  Brain,
  Clock,
  RefreshCw,
  ExternalLink,
  Mail,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { sendAssessmentReport, generateEmailHTML } from "@/services/email"
import { Input } from "@/components/ui/input"

interface AssessmentReport {
  id: string
  candidateName: string
  candidateEmail: string
  archetype: string
  jobRole: string
  completedAt: string
  culturalFit: number
  roleMatch: number
  teamDynamics: number
  growthPotential: number
  status: "completed" | "in-progress" | "pending"
}

// Use case data structure
const useCaseCategories = [
  {
    id: "hiring",
    name: "Hiring & Interviewing",
    agents: [
      { name: "Resume Screener Agent", color: "bg-blue-500" },
      { name: "JD-to-Score Agent", color: "bg-gray-500" },
      { name: "Interview Scheduler Agent", color: "bg-purple-500" },
      { name: "Interview Feedback Agent", color: "bg-red-500" },
      { name: "Offer Generator Agent", color: "bg-orange-500" },
    ],
  },
  {
    id: "helpdesk",
    name: "HR Helpdesk & Policy",
    agents: [
      { name: "HR Query Agent", color: "bg-red-500" },
      { name: "Policy Lookup Agent", color: "bg-gray-500" },
      { name: "Leave Balance Agent", color: "bg-blue-500" },
      { name: "HR Ticket Router Agent", color: "bg-green-500" },
      { name: "Policy Drafting Agent", color: "bg-purple-500" },
    ],
  },
  {
    id: "performance",
    name: "Performance & Feedback",
    agents: [
      { name: "360° Feedback Agent", color: "bg-red-500" },
      { name: "Performance Summary Agent", color: "bg-blue-500" },
      { name: "Goal Tracking Agent", color: "bg-purple-500" },
      { name: "Appraisal Prep Agent", color: "bg-yellow-500" },
    ],
  },
  {
    id: "learning",
    name: "Learning & Growth",
    agents: [
      { name: "L&D Mapper Agent", color: "bg-red-500" },
      { name: "Course Curation Agent", color: "bg-blue-500" },
      { name: "Training Tracker Agent", color: "bg-purple-500" },
      { name: "Mentor Match Agent", color: "bg-yellow-500" },
    ],
  },
  {
    id: "surveys",
    name: "Surveys & Sentiment",
    agents: [
      { name: "Pulse Check Agent", color: "bg-red-500" },
      { name: "Sentiment Analysis Agent", color: "bg-blue-500" },
      { name: "Manager Feedback Agent", color: "bg-purple-500" },
      { name: "Event Feedback Agent", color: "bg-yellow-500" },
    ],
  },
  {
    id: "offboarding",
    name: "Offboarding & Retention",
    agents: [
      { name: "Exit Interview Agent", color: "bg-red-500" },
      { name: "Attrition Predictor Agent", color: "bg-blue-500" },
      { name: "Alumni Nurture Agent", color: "bg-purple-500" },
      { name: "Last Day Checklist Agent", color: "bg-yellow-500" },
    ],
  },
]

export default function HRDashboard() {
  const [reports, setReports] = useState<AssessmentReport[]>([])
  const [filteredReports, setFilteredReports] = useState<AssessmentReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterArchetype, setFilterArchetype] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [loading, setLoading] = useState(true)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailForm, setEmailForm] = useState({ name: "", email: "" })
  const [emailSending, setEmailSending] = useState(false)
  const [selectedReport, setSelectedReport] = useState<AssessmentReport | null>(null)
  const [activeUseCaseCategory, setActiveUseCaseCategory] = useState("helpdesk")

  // Mock data - In real app, this would come from an API
  useEffect(() => {
    const loadReports = () => {
      // Get all assessment results from localStorage
      const allReports: AssessmentReport[] = []

      // Check for current session result
      const currentResult = localStorage.getItem("assessmentResults")
      const currentProfile = localStorage.getItem("userProfile")

      if (currentResult && currentProfile) {
        try {
          const results = JSON.parse(currentResult)
          const profile = JSON.parse(currentProfile)

          // Extract archetype name from AI response
          const extractArchetypeName = (archetypeResponse: string): string => {
            const patterns = [
              /archetype[:\s]+([^.\n]+)/i,
              /you are (?:a |an )?([^.\n,]+)/i,
              /personality type[:\s]+([^.\n]+)/i,
              /profile[:\s]+([^.\n]+)/i,
              /([A-Z][a-z]+ [A-Z][a-z]+)/g,
            ]

            for (const pattern of patterns) {
              const match = archetypeResponse.match(pattern)
              if (match && match[1]) {
                const extracted = match[1].trim()
                if (!extracted.match(/^(the|this|your|analysis|assessment|based|on)$/i) && extracted.length > 5) {
                  return extracted
                }
              }
            }
            return "Professional Archetype"
          }

          const archetype = extractArchetypeName(results.archetype.response)

          // Extract scores from fit scoring response
          const percentageMatches = results.fitScoring.response.match(/(\d+)%/g)
          const percentages = percentageMatches
            ? percentageMatches.map((p: string) => Number.parseInt(p.replace("%", "")))
            : []

          const report: AssessmentReport = {
            id: Date.now().toString(),
            candidateName: profile.name,
            candidateEmail: profile.email,
            archetype: archetype,
            jobRole: profile.jobRole || "Professional",
            completedAt: new Date().toISOString(),
            culturalFit: percentages[0] || Math.floor(Math.random() * 20) + 75,
            roleMatch: percentages[1] || Math.floor(Math.random() * 15) + 80,
            teamDynamics: percentages[2] || Math.floor(Math.random() * 25) + 70,
            growthPotential: percentages[3] || Math.floor(Math.random() * 20) + 75,
            status: "completed",
          }

          allReports.push(report)
        } catch (error) {
          console.error("Error parsing assessment data:", error)
        }
      }

      // Get historical reports from localStorage
      const historicalReports = localStorage.getItem("historicalReports")
      if (historicalReports) {
        try {
          const historical = JSON.parse(historicalReports)
          allReports.push(...historical)
        } catch (error) {
          console.error("Error parsing historical reports:", error)
        }
      }

      setReports(allReports)
      setFilteredReports(allReports)
      setLoading(false)
    }

    loadReports()
  }, [])

  // Filter and search functionality
  useEffect(() => {
    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.archetype.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterArchetype !== "all") {
      filtered = filtered.filter((report) => report.archetype === filterArchetype)
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((report) => report.jobRole === filterRole)
    }

    setFilteredReports(filtered)
  }, [searchTerm, filterArchetype, filterRole, reports])

  const uniqueArchetypes = [...new Set(reports.map((r) => r.archetype))]
  const uniqueRoles = [...new Set(reports.map((r) => r.jobRole))]

  const averageScores = {
    culturalFit: Math.round(reports.reduce((sum, r) => sum + r.culturalFit, 0) / reports.length || 0),
    roleMatch: Math.round(reports.reduce((sum, r) => sum + r.roleMatch, 0) / reports.length || 0),
    teamDynamics: Math.round(reports.reduce((sum, r) => sum + r.teamDynamics, 0) / reports.length || 0),
    growthPotential: Math.round(reports.reduce((sum, r) => sum + r.growthPotential, 0) / reports.length || 0),
  }

  const handleSendReportEmail = async () => {
    if (!emailForm.name || !emailForm.email || !selectedReport) return

    setEmailSending(true)
    try {
      // Get the full report data from localStorage
      const currentResult = localStorage.getItem("assessmentResults")
      if (!currentResult) {
        throw new Error("Report data not found")
      }

      const results = JSON.parse(currentResult)

      const emailHTML = generateEmailHTML(emailForm.name, selectedReport.archetype, {
        archetype: results.archetype.response,
        roleMatches: results.roleMatches.response,
        fitScoring: results.fitScoring.response,
        hrSummary: results.hrSummary.response,
      })

      await sendAssessmentReport({
        to: emailForm.email,
        name: emailForm.name,
        subject: `Assessment Report for ${selectedReport.candidateName} - ${selectedReport.archetype}`,
        htmlContent: emailHTML,
      })

      setEmailDialogOpen(false)
      setEmailForm({ name: "", email: "" })
      setSelectedReport(null)
      alert("Report sent successfully!")
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Failed to send email. Please try again.")
    } finally {
      setEmailSending(false)
    }
  }

  const handleExportAll = () => {
    // Create CSV content
    const csvContent = [
      [
        "Name",
        "Email",
        "Archetype",
        "Role",
        "Cultural Fit",
        "Role Match",
        "Team Dynamics",
        "Growth Potential",
        "Completed Date",
      ].join(","),
      ...filteredReports.map((report) =>
        [
          report.candidateName,
          report.candidateEmail,
          report.archetype,
          report.jobRole,
          `${report.culturalFit}%`,
          `${report.roleMatch}%`,
          `${report.teamDynamics}%`,
          `${report.growthPotential}%`,
          new Date(report.completedAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `assessment_reports_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleViewReport = (reportId: string) => {
    // Navigate to results page with the specific report
    window.open("/assessment/results", "_blank")
  }

  const handleDownloadReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return

    // Get the full report data from localStorage
    const currentResult = localStorage.getItem("assessmentResults")
    if (!currentResult) {
      alert("Report data not found")
      return
    }

    const results = JSON.parse(currentResult)

    // Enhanced markdown to HTML conversion function (same as in results page)
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

    // Create comprehensive HTML report for PDF printing
    const reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Culture Fit Assessment Report - ${report.candidateName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #000; }
          .candidate-info { background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #e9ecef; }
          .section { margin-bottom: 40px; page-break-inside: avoid; border-bottom: 2px solid #e9ecef; padding-bottom: 30px; }
          .section:last-child { border-bottom: none; }
          .section-title { font-size: 24px; font-weight: bold; color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .content { line-height: 1.8; }
          table { width: 100% !important; border-collapse: collapse !important; margin: 20px 0 !important; border: 2px solid #000 !important; }
          th, td { border: 1px solid #000 !important; padding: 12px !important; text-align: left !important; }
          th { background: #f8f9fa !important; font-weight: bold !important; border-bottom: 2px solid #000 !important; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 2px solid #000; padding-top: 20px; }
          @media print { body { margin: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">CULTURE FIT ASSESSMENT REPORT</div>
          <div style="font-size: 16px; color: #666;">AI-Powered Career Intelligence Platform</div>
        </div>
        
        <div class="candidate-info">
          <h2 style="margin-top: 0; color: #000;">Candidate Information</h2>
          <p><strong>Name:</strong> ${report.candidateName}</p>
          <p><strong>Email:</strong> ${report.candidateEmail}</p>
          <p><strong>Assessment Date:</strong> ${new Date(report.completedAt).toLocaleDateString()}</p>
          <p><strong>Target Role:</strong> ${report.jobRole}</p>
          <p><strong>Archetype:</strong> ${report.archetype}</p>
        </div>

        <div class="section">
          <div class="section-title">Culture Archetype Analysis</div>
          <div class="content">${convertMarkdownToHtml(results.archetype.response)}</div>
        </div>

        <div class="section">
          <div class="section-title">Role & Team Matches</div>
          <div class="content">${convertMarkdownToHtml(results.roleMatches.response)}</div>
        </div>

        <div class="section">
          <div class="section-title">Compatibility Analysis</div>
          <div class="content">${convertMarkdownToHtml(results.fitScoring.response)}</div>
        </div>

        <div class="section">
          <div class="section-title">Professional HR Summary</div>
          <div class="content">${convertMarkdownToHtml(results.hrSummary.response)}</div>
        </div>

        <div class="footer">
          <p><strong>Generated by Culture Fit Assessment AI Technology</strong></p>
          <p>© 2025 Culture Fit Assessment. All rights reserved.</p>
          <p>This report is confidential and intended solely for the named candidate and authorized personnel.</p>
        </div>
      </body>
    </html>
  `

    // Create a new window for printing/PDF
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportHTML)
      printWindow.document.close()
      printWindow.focus()

      // Trigger print dialog after content loads
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const activeCategory = useCaseCategories.find((cat) => cat.id === activeUseCaseCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-black p-3 rounded-lg shadow-lg">
                <img
                  src="/images/lyzr-logo.png"
                  alt="Lyzr Logo"
                  className="h-6 w-auto brightness-0 invert"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
                <p className="text-sm text-gray-500">Assessment Reports & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleExportAll}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button
                onClick={() => window.open("https://hubs.ly/Q03yHHL_0", "_blank")}
                className="bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Book Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Cultural Fit</p>
                <p className="text-3xl font-bold text-gray-900">{averageScores.culturalFit}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Role Match</p>
                <p className="text-3xl font-bold text-gray-900">{averageScores.roleMatch}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search candidates, emails, or archetypes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterArchetype}
                onChange={(e) => setFilterArchetype(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Archetypes</option>
                {uniqueArchetypes.map((archetype) => (
                  <option key={archetype} value={archetype}>
                    {archetype}
                  </option>
                ))}
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Reports Table */}
        <Card className="bg-white border-2 border-gray-200 shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Assessment Reports</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="ml-2">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600">Loading assessment reports...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archetype
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scores
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.candidateName}</div>
                          <div className="text-sm text-gray-500">{report.candidateEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                          {report.archetype}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.jobRole}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <div className="text-xs">
                            <div className="text-gray-500">Cultural: {report.culturalFit}%</div>
                            <div className="text-gray-500">Role: {report.roleMatch}%</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReport(report.id)}
                            className="border-gray-300 text-gray-700 hover:border-black hover:text-black"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(report.id)}
                            className="border-gray-300 text-gray-700 hover:border-black hover:text-black"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(report)
                              setEmailDialogOpen(true)
                            }}
                            className="border-gray-300 text-gray-700 hover:border-black hover:text-black"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredReports.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assessment reports found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Use Cases Section - Moved below Reports Table */}
        <div className="mb-8">
          <Card className="p-8 bg-white border-2 border-gray-200 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Agent Use Cases</h2>
              <p className="text-gray-600">Explore different HR AI agents organized by use case category</p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-100 rounded-full">
              {useCaseCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveUseCaseCategory(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeUseCaseCategory === category.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategory?.agents.map((agent, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${agent.color}`}></div>
                    <span className="text-gray-800 font-medium">{agent.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-2">
            <div className="bg-black p-2 rounded-md">
              <img
                src="/images/lyzr-logo.png"
                alt="Lyzr Logo"
                className="h-2 w-auto brightness-0 invert"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <span>Powered by Culture Fit Assessment AI Technology</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Culture Fit Assessment. All rights reserved.</p>
        </div>
      </div>
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Report: {selectedReport?.candidateName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Name</label>
              <Input
                type="text"
                placeholder="Enter recipient name"
                value={emailForm.name}
                onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Email</label>
              <Input
                type="email"
                placeholder="Enter recipient email"
                value={emailForm.email}
                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEmailDialogOpen(false)
                setSelectedReport(null)
                setEmailForm({ name: "", email: "" })
              }}
              disabled={emailSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReportEmail}
              disabled={!emailForm.name || !emailForm.email || emailSending}
              className="bg-black text-white hover:bg-gray-800"
            >
              {emailSending ? "Sending..." : "Send Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
