interface EmailData {
  to: string
  name: string
  subject: string
  htmlContent: string
  jobListings?: any[]
  pdfAttachment?: string
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_KJWKEP8s_FfbSMUVdnmxrA5H21SBJc2zC"
const LYZR_LOGO_URL = process.env.LYZR_LOGO_URL || "https://1udttk3k46ul12ol.public.blob.vercel-storage.com/433563f2-5da2-4e79-8226-0d7bed5fbc38.png"

export async function sendAssessmentReport(emailData: EmailData) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export function generateEmailHTML(
  candidateName: string,
  archetype: string,
  reportContent: {
    archetype: string
    roleMatches: string
    fitScoring: string
    hrSummary: string
  },
  jobListings: any[] = []
): string {
  const logoUrl = LYZR_LOGO_URL || "https://via.placeholder.com/120x40/000000/FFFFFF?text=LYZR"
  
  // Generate job listings HTML with circular progress indicators
  const jobListingsHTML = jobListings.length > 0 ? `
  <div class="section">
    <h3>🎯 Recommended Job Opportunities</h3>
    <div class="section-content">
      <p>Based on your archetype analysis, here are some job opportunities that match your profile:</p>
      <div style="margin-top: 20px;">
        ${jobListings.map(job => `
          <div style="border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #f8f9fa;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 48px; height: 48px; background: #e9ecef; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; overflow: hidden;">
                ${job.companyLogo ? 
                  `<img src="${job.companyLogo}" alt="${job.company} logo" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                   <span style="color: #666; font-weight: bold; font-size: 18px; display: none;">${job.company.charAt(0)}</span>` :
                  `<span style="color: #666; font-weight: bold; font-size: 18px;">${job.company.charAt(0)}</span>`
                }
              </div>
              <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; color: #000; font-size: 18px;">${job.title}</h4>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px; font-weight: bold;">${job.company}</p>
                <p style="margin: 0; color: #888; font-size: 12px;">${job.location}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 5px;">
                  ${job.matchPercentage || 85}%
                </div>
                <div style="font-size: 12px; color: #666;">Match</div>
              </div>
            </div>
            <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">${job.description}</p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px; padding: 15px; background: #f0f0f0; border-radius: 6px;">
              <div style="text-align: center;">
                <div style="width: 50px; height: 50px; margin: 0 auto 8px; position: relative;">
                  <svg width="50" height="50" style="transform: rotate(-90deg);">
                    <circle cx="25" cy="25" r="20" stroke="#e5e7eb" stroke-width="4" fill="none"/>
                    <circle cx="25" cy="25" r="20" stroke="#059669" stroke-width="4" fill="none" 
                            stroke-dasharray="${2 * Math.PI * 20}" 
                            stroke-dashoffset="${2 * Math.PI * 20 * (1 - (job.culturalFit || 75) / 100)}" 
                            stroke-linecap="round"/>
                  </svg>
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: bold;">${job.culturalFit || 75}%</div>
                </div>
                <div style="font-size: 11px; color: #666;">Cultural Fit</div>
              </div>
              <div style="text-align: center;">
                <div style="width: 50px; height: 50px; margin: 0 auto 8px; position: relative;">
                  <svg width="50" height="50" style="transform: rotate(-90deg);">
                    <circle cx="25" cy="25" r="20" stroke="#e5e7eb" stroke-width="4" fill="none"/>
                    <circle cx="25" cy="25" r="20" stroke="#3B82F6" stroke-width="4" fill="none" 
                            stroke-dasharray="${2 * Math.PI * 20}" 
                            stroke-dashoffset="${2 * Math.PI * 20 * (1 - (job.roleMatch || 80) / 100)}" 
                            stroke-linecap="round"/>
                  </svg>
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: bold;">${job.roleMatch || 80}%</div>
                </div>
                <div style="font-size: 11px; color: #666;">Role Match</div>
              </div>
              <div style="text-align: center;">
                <div style="width: 50px; height: 50px; margin: 0 auto 8px; position: relative;">
                  <svg width="50" height="50" style="transform: rotate(-90deg);">
                    <circle cx="25" cy="25" r="20" stroke="#e5e7eb" stroke-width="4" fill="none"/>
                    <circle cx="25" cy="25" r="20" stroke="#8B5CF6" stroke-width="4" fill="none" 
                            stroke-dasharray="${2 * Math.PI * 20}" 
                            stroke-dashoffset="${2 * Math.PI * 20 * (1 - (job.teamDynamics || 70) / 100)}" 
                            stroke-linecap="round"/>
                  </svg>
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: bold;">${job.teamDynamics || 70}%</div>
                </div>
                <div style="font-size: 11px; color: #666;">Team Dynamics</div>
              </div>
              <div style="text-align: center;">
                <div style="width: 50px; height: 50px; margin: 0 auto 8px; position: relative;">
                  <svg width="50" height="50" style="transform: rotate(-90deg);">
                    <circle cx="25" cy="25" r="20" stroke="#e5e7eb" stroke-width="4" fill="none"/>
                    <circle cx="25" cy="25" r="20" stroke="#F59E0B" stroke-width="4" fill="none" 
                            stroke-dasharray="${2 * Math.PI * 20}" 
                            stroke-dashoffset="${2 * Math.PI * 20 * (1 - (job.growthPotential || 75) / 100)}" 
                            stroke-linecap="round"/>
                  </svg>
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: bold;">${job.growthPotential || 75}%</div>
                </div>
                <div style="font-size: 11px; color: #666;">Growth Potential</div>
              </div>
            </div>
            <a href="${job.link}" style="display: inline-block; background: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Apply Now</a>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
` : ''

  // Update the CTA section to include three buttons
  const ctaSection = `
    <div class="cta-section">
      <h3>Ready to Level Up Your AI Skills?</h3>
      <p>Discover how to build AI agents like the ones that analyzed your profile. Join thousands of professionals mastering AI technology.</p>
      <div class="cta-buttons">
        <a href="https://academy.lyzr.ai/c/agent-architect-course/" class="cta-button">🎓 Agent Architect Course</a>
        <a href="https://academy.lyzr.ai/c/live-sessions/" class="cta-button">🚀 Live Cohort Sessions</a>
        <a href="https://hubs.ly/Q03yHHL_0" class="cta-button">📅 Book a Demo</a>
      </div>
    </div>
  `

  // Add CSS for the new button layout
  const additionalCSS = `
    .cta-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 25px;
    }
    .cta-button:hover {
      background: #f0f0f0;
    }
    @media (max-width: 600px) {
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
      .cta-button {
        width: 200px;
        text-align: center;
      }
    }
    .colored-section {
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .colored-section:nth-child(1) {
      border-left-color: #3B82F6;
      background-color: #EFF6FF;
    }
    .colored-section:nth-child(2) {
      border-left-color: #10B981;
      background-color: #ECFDF5;
    }
    .colored-section:nth-child(3) {
      border-left-color: #8B5CF6;
      background-color: #F3E8FF;
    }
    .colored-section:nth-child(4) {
      border-left-color: #F59E0B;
      background-color: #FFFBEB;
    }
    .colored-section:nth-child(5) {
      border-left-color: #EF4444;
      background-color: #FEF2F2;
    }
  `
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Lyzr Assessment Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            margin-bottom: 20px;
          }
          .logo img {
            height: 40px;
            width: auto;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 5px solid #000000;
          }
          .greeting h2 {
            margin: 0 0 15px 0;
            color: #000000;
            font-size: 24px;
          }
          .archetype-badge {
            display: inline-block;
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
          }
          .section {
            margin-bottom: 35px;
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            background: #ffffff;
          }
          .section h3 {
            color: #000000;
            font-size: 20px;
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
          }
          .section-content {
            color: #555;
            line-height: 1.7;
          }
          .section-content p {
            margin-bottom: 15px;
          }
          .section-content strong {
            color: #000000;
            font-weight: 600;
          }
          .cta-section {
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 12px;
            margin: 30px 0;
          }
          .cta-section h3 {
            margin: 0 0 15px 0;
            font-size: 22px;
          }
          .cta-section p {
            margin: 0 0 25px 0;
            opacity: 0.9;
          }
          .cta-button {
            display: inline-block;
            background: white;
            color: #000000;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 2px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
          }
          .footer .logo {
            margin-bottom: 15px;
          }
          .footer .logo img {
            height: 24px;
            opacity: 0.7;
          }
          @media (max-width: 600px) {
            .container {
              margin: 0;
            }
            .header, .content, .footer {
              padding: 20px;
            }
            .greeting, .section {
              padding: 20px;
            }
            .header h1 {
              font-size: 24px;
            }
          }
          ${additionalCSS}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="${logoUrl}" alt="Lyzr Logo" />
            </div>
            <h1>Your Assessment Report</h1>
            <p>AI-Powered Career Intelligence</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <h2>Hello ${candidateName}!</h2>
              <p>Thank you for completing the Culture Fit Assessment assessment. Our AI agents have analyzed your responses and generated comprehensive insights about your workplace preferences and career alignment.</p>
              <div class="archetype-badge">Your Archetype: ${archetype}</div>
            </div>
            ${jobListingsHTML}

            <div class="section">
              <h3>🧠 Culture Archetype Analysis</h3>
              <div class="section-content">
                ${formatContentForEmailWithColors(reportContent.archetype)}
              </div>
            </div>

            <div class="section">
              <h3>👥 Role & Team Matches</h3>
              <div class="section-content">
                ${formatContentForEmailWithColors(reportContent.roleMatches)}
              </div>
            </div>

            <div class="section">
              <h3>🎯 Compatibility Analysis</h3>
              <div class="section-content">
                ${formatContentForEmailWithColors(reportContent.fitScoring)}
              </div>
            </div>

            <div class="section">
              <h3>📋 Professional Summary</h3>
              <div class="section-content">
                ${formatContentForEmailWithColors(reportContent.hrSummary)}
              </div>
            </div>

            ${ctaSection}
          </div>

          <div class="footer">
            <div class="logo">
              <img src="${logoUrl}" alt="Lyzr Logo" />
            </div>
            <p><strong>Powered by Lyzr AI Technology</strong></p>
            <p>© 2025 Culture Fit Assessment. All rights reserved.</p>
            <p>This report is confidential and intended solely for ${candidateName}.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateComprehensivePDF(
  candidateName: string,
  archetype: string,
  reportContent: {
    archetype: string
    roleMatches: string
    fitScoring: string
    hrSummary: string
  },
  jobListings: any[] = []
): string {
  // Clean and format content for PDF
  const cleanContent = (content: string): string => {
    return content
      .replace(/<\/?BOLD>/g, '')
      .replace(/<BOLD>\s*(.*?)\s*<\/BOLD>/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/### (.*)/g, '\n$1\n' + '='.repeat(50))
      .replace(/## (.*)/g, '\n$1\n' + '='.repeat(60))
      .replace(/# (.*)/g, '\n$1\n' + '='.repeat(70))
      .replace(/\|/g, ' | ')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/^\s*\d+\.\s+/gm, '• ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  const formatJobListings = (jobs: any[]): string => {
  if (jobs.length === 0) return 'No job listings available at this time.'
  
  return jobs.map((job, index) => 
    `${index + 1}. ${job.title}
   Company: ${job.company}
   Location: ${job.location || 'Not specified'}
   Match Percentage: ${job.matchPercentage || 85}%
   
   Performance Metrics:
   - Cultural Fit: ${job.culturalFit || Math.floor(Math.random() * 20) + 75}%
   - Role Match: ${job.roleMatch || Math.floor(Math.random() * 15) + 80}%
   - Team Dynamics: ${job.teamDynamics || Math.floor(Math.random() * 25) + 70}%
   - Growth Potential: ${job.growthPotential || Math.floor(Math.random() * 20) + 75}%
   
   Description: ${job.description}
   Apply: ${job.link}
   
`).join('')
}

  // Create comprehensive PDF content
  const fullContent = `
LYZR ASSESSMENT REPORT
${'='.repeat(80)}

CANDIDATE INFORMATION
${'='.repeat(50)}
Name: ${candidateName}
Archetype: ${archetype}
Assessment Date: ${new Date().toLocaleDateString()}
Generated by: Lyzr AI Technology

${'='.repeat(80)}

JOB OPPORTUNITIES (${jobListings.length} Found)
${'='.repeat(50)}
Based on your archetype analysis, here are job opportunities that match your profile:

${formatJobListings(jobListings)}

${'='.repeat(80)}

CULTURE ARCHETYPE ANALYSIS
${'='.repeat(50)}
${cleanContent(reportContent.archetype)}

${'='.repeat(80)}

ROLE & TEAM MATCHES
${'='.repeat(50)}
${cleanContent(reportContent.roleMatches)}

${'='.repeat(80)}

COMPATIBILITY ANALYSIS
${'='.repeat(50)}
${cleanContent(reportContent.fitScoring)}

${'='.repeat(80)}

PROFESSIONAL SUMMARY
${'='.repeat(50)}
${cleanContent(reportContent.hrSummary)}

${'='.repeat(80)}

NEXT STEPS & RESOURCES
${'='.repeat(50)}
Ready to Level Up Your AI Skills?

Discover how to build AI agents like the ones that analyzed your profile. 
Join thousands of professionals mastering AI technology.

Resources:
• Agent Architect Course: https://academy.lyzr.ai/c/agent-architect-course/
• Live Cohort Sessions: https://academy.lyzr.ai/c/live-sessions/
• Book a Demo: https://hubs.ly/Q03yHHL_0

${'='.repeat(80)}

ABOUT LYZR
${'='.repeat(50)}
This assessment was powered by Lyzr AI Technology, the leading platform for 
building AI-powered applications. Lyzr helps organizations create custom 
culture assessments, employee-role matchers, and AI-powered hiring tools.

Learn more: https://lyzr.ai

${'='.repeat(80)}

CONFIDENTIALITY NOTICE
${'='.repeat(50)}
This report is confidential and intended solely for ${candidateName} and 
authorized personnel. The insights and recommendations contained herein are 
based on AI analysis of assessment responses and should be used as guidance 
in conjunction with other evaluation methods.

© 2025 Culture Fit Assessment. All rights reserved.
Generated on: ${new Date().toLocaleString()}

${'='.repeat(80)}
END OF REPORT
  `.trim()

  // Split content into lines for PDF generation
  const lines = fullContent.split('\n')
  const maxLinesPerPage = 45
  const pages = []
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage))
  }

  // Generate PDF structure
  let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [`

  // Add page references
  for (let i = 0; i < pages.length; i++) {
    pdfContent += `${3 + i} 0 R `
  }

  pdfContent += `]
/Count ${pages.length}
>>
endobj
`

  // Generate pages
  pages.forEach((pageLines, pageIndex) => {
    const pageNum = 3 + pageIndex
    const contentNum = pageNum + pages.length
    
    pdfContent += `
${pageNum} 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents ${contentNum} 0 R
/Resources <<
/Font <<
/F1 ${3 + pages.length * 2} 0 R
>>
>>
>>
endobj
`
  })

  // Generate content streams
  pages.forEach((pageLines, pageIndex) => {
    const contentNum = 3 + pages.length + pageIndex
    const pageContent = pageLines.join('\n')
    
    pdfContent += `
${contentNum} 0 obj
<<
/Length ${pageContent.length + 200}
>>
stream
BT
/F1 10 Tf
50 750 Td
`
    
    pageLines.forEach(line => {
      const cleanLine = line.replace(/[()\\]/g, '\\$&').substring(0, 80)
      pdfContent += `(${cleanLine}) Tj 0 -14 Td\n`
    })
    
    pdfContent += `ET
endstream
endobj
`
  })

  // Add font
  const fontNum = 3 + pages.length * 2
  pdfContent += `
${fontNum} 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
`

  // Add xref table
  pdfContent += `
xref
0 ${fontNum + 1}
0000000000 65535 f `

  for (let i = 1; i <= fontNum; i++) {
    pdfContent += `\n0000000010 00000 n `
  }

  pdfContent += `
trailer
<<
/Size ${fontNum + 1}
/Root 1 0 R
>>
startxref
${pdfContent.length + 100}
%%EOF`

  return Buffer.from(pdfContent).toString('base64')
}

function formatContentForEmailWithColors(content: string): string {
  if (!content) return '<p>Content not available</p>'
  
  // Split content into colored sections
  const sections = splitIntoColoredSections(content)
  
  if (sections.length === 0) {
    return '<div class="colored-section"><p>Content is being processed by our AI agents...</p></div>'
  }

  return sections.map((section, index) => {
    const formattedSection = formatContentForEmail(section)
    return `<div class="colored-section">${formattedSection}</div>`
  }).join('')
}

function formatContentForEmail(content: string): string {
  if (!content) return '<p>Content not available</p>'
  
  // Convert markdown-like formatting to HTML with better table support
  let formatted = content
    // Remove <BOLD> tags and convert to HTML
    .replace(/<\/?BOLD>/g, '')
    .replace(/<BOLD>\s*(.*?)\s*<\/BOLD>/g, '**$1**')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #000;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
    // Convert headers with proper styling
    .replace(/### (.*)/g, '<h4 style="color: #000; font-size: 16px; margin: 20px 0 10px 0; font-weight: bold; border-bottom: 1px solid #e9ecef; padding-bottom: 5px;">$1</h4>')
    .replace(/## (.*)/g, '<h3 style="color: #000; font-size: 18px; margin: 25px 0 15px 0; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 8px;">$1</h3>')
    .replace(/# (.*)/g, '<h2 style="color: #000; font-size: 20px; margin: 30px 0 20px 0; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 10px;">$1</h2>')

  // Enhanced table conversion
  const lines = formatted.split('\n')
  let inTable = false
  let tableHtml = ''
  let processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip lines with only dashes or empty content
    if (!line || line.match(/^[-\s|]*$/) || line === '##') {
      if (!inTable) processedLines.push(line)
      continue
    }
    
    // Check if this line starts a table
    if (line.includes('|') && line.split('|').length >= 3) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell && !cell.match(/^[-\s]*$/))
      
      if (cells.length === 0) {
        continue // Skip empty table rows
      }
      
      if (!inTable) {
        // Start of table
        inTable = true
        
        // Check if next line is separator
        const nextLine = lines[i + 1]?.trim()
        const isSeparator = nextLine && nextLine.includes('|') && nextLine.includes('-')
        
        if (isSeparator) {
          // This is a header row
          tableHtml = `<div style="margin: 20px 0; border: 2px solid #000; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; margin: 0;">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #000;">
                  ${cells.map(cell => `<th style="border-right: 1px solid #000; padding: 12px; text-align: left; font-weight: bold; color: #000;">${cell}</th>`).join('')}
                </tr>
              </thead>
              <tbody>`
          i++ // Skip separator line
        } else {
          // Regular table row
          tableHtml = `<div style="margin: 20px 0; border: 2px solid #000; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; margin: 0;">
              <tbody>
                <tr>
                  ${cells.map(cell => `<td style="border-right: 1px solid #000; padding: 12px; color: #333;">${cell}</td>`).join('')}
                </tr>`
        }
      } else {
        // Continue table
        tableHtml += `<tr style="border-top: 1px solid #ddd;">
          ${cells.map(cell => `<td style="border-right: 1px solid #000; padding: 12px; color: #333;">${cell}</td>`).join('')}
        </tr>`
      }
    } else if (inTable && line === '') {
      // End of table
      tableHtml += '</tbody></table></div>'
      processedLines.push(tableHtml)
      inTable = false
      tableHtml = ''
    } else if (!inTable) {
      processedLines.push(line)
    }
  }

  // Close any remaining table
  if (inTable) {
    tableHtml += '</tbody></table></div>'
    processedLines.push(tableHtml)
  }

  formatted = processedLines.join('\n')

  // Convert bullet points with better styling
  formatted = formatted.replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin-bottom: 8px; color: #333;">$1</li>')
  // Convert numbered lists
  formatted = formatted.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin-bottom: 8px; color: #333;">$1</li>')
  
  // Handle lists with proper styling
  formatted = formatted.replace(/(<li.*?<\/li>)/gs, '<ul style="margin: 15px 0; padding-left: 25px; border-left: 3px solid #e9ecef; padding-left: 20px;">$1</ul>')
  
  // Convert paragraphs with section boundaries
  formatted = formatted.replace(/\n\n/g, '</p><div style="border-bottom: 1px solid #e9ecef; margin: 20px 0;"></div><p style="margin-bottom: 15px; line-height: 1.7; color: #333;">')
  formatted = formatted.replace(/\n/g, '<br>')

  // Wrap in paragraph tags
  formatted = '<p style="margin-bottom: 15px; line-height: 1.7; color: #333;">' + formatted + '</p>'
  
  return formatted
}

function splitIntoColoredSections(content: string): string[] {
  if (!content || content.trim() === '') return []

  // Clean up content first
  const cleanContent = content
    .replace(/<\/?BOLD>/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\[[\d,\s]+\]/g, '')
    .replace(/<BOLD>\s*(.*?)\s*<\/BOLD>/g, '**$1**')
    .replace(/\*{3,}/g, '')
    .replace(/^\*\s*/gm, '')
    .replace(/^\s*$/gm, '')
    .replace(/^#+\s*$/gm, '')
    .replace(/^\s*[-|:\s]*$/gm, '')
    .trim()

  if (!cleanContent || cleanContent === '##' || cleanContent.match(/^[#\s|:-]*$/)) {
    return []
  }

  // Split by headers first
  const headerSections = cleanContent.split(/(?=##\s)|(?=###\s)/).filter(section => {
    const trimmed = section.trim()
    return trimmed && 
           trimmed !== '##' && 
           !trimmed.match(/^[#\s|:-]*$/) &&
           trimmed.length > 20
  })

  if (headerSections.length >= 5) {
    return headerSections.slice(0, 5)
  }

  // If we don't have enough header sections, split by paragraphs
  const paragraphs = cleanContent.split(/\n\n+/).filter(p => {
    const trimmed = p.trim()
    return trimmed && trimmed.length > 30 && !trimmed.match(/^[#\s|:-]*$/)
  })

  if (paragraphs.length >= 5) {
    return paragraphs.slice(0, 5)
  }

  // If still not enough, split by sentences
  const sentences = cleanContent.split(/[.!?]+/).filter(s => {
    const trimmed = s.trim()
    return trimmed && trimmed.length > 20
  })

  // Group sentences into 5 sections
  const sectionsCount = Math.min(5, Math.max(1, sentences.length))
  const sentencesPerSection = Math.ceil(sentences.length / sectionsCount)
  const sections: string[] = []

  for (let i = 0; i < sectionsCount; i++) {
    const start = i * sentencesPerSection
    const end = Math.min(start + sentencesPerSection, sentences.length)
    const sectionContent = sentences.slice(start, end).join('. ').trim()
    if (sectionContent) {
      sections.push(sectionContent + (sectionContent.endsWith('.') ? '' : '.'))
    }
  }

  return sections.length > 0 ? sections : [cleanContent]
}

// Export the comprehensive PDF function
export { generateComprehensivePDF }
