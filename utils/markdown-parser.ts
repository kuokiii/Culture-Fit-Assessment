import React from 'react'

export function parseMarkdownToReact(text: string): React.ReactNode[] {
  if (!text || text.trim() === '') return []

  // Clean up the text first - completely remove <BOLD> tags
  let cleanText = text
    .replace(/<\/?BOLD>/g, '') // Remove opening and closing BOLD tags
    .replace(/<BOLD>\s*(.*?)\s*<\/BOLD>/g, '**$1**') // Convert any remaining BOLD tags to markdown
    .replace(/\[\d+\]/g, '') // Remove reference numbers
    .replace(/\[[\d,\s]+\]/g, '') // Remove reference ranges
    .replace(/\n{3,}/g, '\n\n') // Clean up multiple empty lines
    .trim()

  // If after cleaning we have no content, return empty
  if (!cleanText || cleanText === '##' || cleanText.match(/^[#\s|-]*$/)) {
    return [React.createElement("p", { key: 0, className: "text-gray-500 italic" }, "Content not available")]
  }

  const lines = cleanText.split("\n")
  const elements: React.ReactNode[] = []
  let keyCounter = 0

  // Process lines and handle tables properly
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines or lines with only special characters
    if (!line || line === '##' || line.match(/^[#\s|:-]*$/)) {
      continue
    }

    // Headers
    if (line.startsWith("### ")) {
      const headerText = line.substring(4).trim()
      if (headerText && headerText !== '##') {
        elements.push(
          React.createElement(
            "h3",
            { key: keyCounter++, className: "text-2xl font-bold mb-4 mt-6 text-gray-900" },
            parseInlineMarkdown(headerText),
          ),
        )
      }
    } else if (line.startsWith("## ")) {
      const headerText = line.substring(3).trim()
      if (headerText && headerText !== '##') {
        elements.push(
          React.createElement(
            "h2",
            { key: keyCounter++, className: "text-3xl font-bold mb-6 mt-8 text-gray-900" },
            parseInlineMarkdown(headerText),
          ),
        )
      }
    } else if (line.startsWith("# ")) {
      const headerText = line.substring(2).trim()
      if (headerText && headerText !== '##') {
        elements.push(
          React.createElement(
            "h1",
            { key: keyCounter++, className: "text-4xl font-bold mb-6 mt-8 text-gray-900" },
            parseInlineMarkdown(headerText),
          ),
        )
      }
    }
    // Tables - Enhanced detection and processing
    else if (line.includes("|") && line.split("|").length >= 3) {
      // Skip separator lines but don't break the table detection
      if (line.match(/^[\s|:-]*$/)) {
        continue
      }

      // Parse table - collect all consecutive table lines
      const tableLines = []
      let j = i

      // Collect all table lines including the current one
      while (j < lines.length) {
        const currentLine = lines[j].trim()
        
        // Stop if we hit an empty line
        if (!currentLine) {
          j++
          break
        }
        
        // If it's a table line, add it (skip separator lines)
        if (currentLine.includes("|") && currentLine.split("|").length >= 3) {
          if (!currentLine.match(/^[\s|:-]*$/)) {
            tableLines.push(currentLine)
          }
          j++
        } else {
          break
        }
      }

      i = j - 1 // Update main loop index

      // Create table element if we have valid table lines
      if (tableLines.length > 0) {
        const tableElement = createEnhancedTableElement(tableLines, keyCounter++)
        if (tableElement) {
          elements.push(tableElement)
        }
      }
    }
    // Bullet points
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const bulletText = line.substring(2).trim()
      if (bulletText && !bulletText.match(/^[-\s]*$/)) {
        elements.push(
          React.createElement(
            "div",
            { key: keyCounter++, className: "flex items-start mb-2" },
            React.createElement("span", { className: "text-blue-500 mr-3 mt-1" }, "•"),
            React.createElement("span", { className: "flex-1" }, parseInlineMarkdown(bulletText)),
          ),
        )
      }
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/)
      if (match && match[2] && !match[2].match(/^[-\s]*$/)) {
        elements.push(
          React.createElement(
            "div",
            { key: keyCounter++, className: "flex items-start mb-2" },
            React.createElement("span", { className: "text-blue-500 mr-3 mt-1 font-semibold" }, match[1] + "."),
            React.createElement("span", { className: "flex-1" }, parseInlineMarkdown(match[2])),
          ),
        )
      }
    }
    // Regular paragraphs
    else {
      elements.push(
        React.createElement(
          "p",
          { key: keyCounter++, className: "mb-4 leading-relaxed" },
          parseInlineMarkdown(line),
        ),
      )
    }
  }

  // If no elements were created, show a fallback message
  if (elements.length === 0) {
    elements.push(
      React.createElement(
        "p", 
        { key: 0, className: "text-gray-500 italic" }, 
        "Content is being processed..."
      )
    )
  }

  return elements
}

function createEnhancedTableElement(tableLines: string[], key: number): React.ReactElement | null {
  if (tableLines.length === 0) return null

  // Parse all rows and clean them
  const rows = tableLines
    .map(line => {
      // Split by | and clean each cell
      const cells = line.split("|")
        .map(cell => cell.trim())
        .filter(cell => cell && !cell.match(/^[-\s]*$/))
      
      return cells.length > 0 ? cells : null
    })
    .filter(row => row !== null) as string[][]

  if (rows.length === 0) return null

  // Determine if we have a header (assume first row is header if we have multiple rows)
  const hasHeader = rows.length > 1
  const headerRow = hasHeader ? rows[0] : null
  const dataRows = hasHeader ? rows.slice(1) : rows

  return React.createElement(
    "div",
    { key, className: "overflow-x-auto my-8" },
    React.createElement(
      "table",
      { className: "min-w-full border-collapse border-2 border-gray-300 bg-white rounded-lg shadow-lg" },
      [
        // Header
        hasHeader && headerRow && React.createElement(
          "thead",
          { key: "thead" },
          React.createElement(
            "tr",
            { key: "header-row", className: "bg-gray-50" },
            headerRow.map((cell, idx) =>
              React.createElement(
                "th",
                {
                  key: idx,
                  className: "border border-gray-300 px-6 py-4 text-left font-bold text-gray-900 text-sm"
                },
                parseInlineMarkdown(cell)
              )
            )
          )
        ),
        // Body
        React.createElement(
          "tbody",
          { key: "tbody" },
          dataRows.map((row, rowIdx) =>
            React.createElement(
              "tr",
              {
                key: rowIdx,
                className: `${rowIdx % 2 === 0 ? "bg-white" : "bg-green-50"} hover:bg-blue-50 transition-colors duration-200`
              },
              row.map((cell, cellIdx) =>
                React.createElement(
                  "td",
                  {
                    key: cellIdx,
                    className: "border border-gray-300 px-6 py-4 text-gray-700 text-sm"
                  },
                  parseInlineMarkdown(cell)
                )
              )
            )
          )
        )
      ].filter(Boolean)
    )
  )
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let currentText = text
  let keyCounter = 0

  // Clean up any remaining <BOLD> tags completely
  currentText = currentText
    .replace(/<\/?BOLD>/g, '') // Remove all BOLD tags
    .replace(/\[\d+\]/g, '') // Remove references
    .replace(/\[[\d,\s]+\]/g, '') // Remove reference ranges

  // Process bold text (**text**)
  currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
    return `<TEMP_BOLD>${content}</TEMP_BOLD>`
  })

  // Process italic text (*text*)
  currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
    return `<TEMP_ITALIC>${content}</TEMP_ITALIC>`
  })

  // Process inline code (`code`)
  currentText = currentText.replace(/`(.*?)`/g, (match, content) => {
    return `<TEMP_CODE>${content}</TEMP_CODE>`
  })

  // Split by our temporary tags and process
  const parts = currentText.split(/(<TEMP_BOLD>.*?<\/TEMP_BOLD>|<TEMP_ITALIC>.*?<\/TEMP_ITALIC>|<TEMP_CODE>.*?<\/TEMP_CODE>)/)

  parts.forEach((part) => {
    if (part.startsWith("<TEMP_BOLD>") && part.endsWith("</TEMP_BOLD>")) {
      const content = part.substring(11, part.length - 12).trim()
      if (content && content.length > 0) { // Only add if content is not empty
        elements.push(React.createElement("strong", { key: keyCounter++, className: "font-bold text-gray-900" }, content))
      }
    } else if (part.startsWith("<TEMP_ITALIC>") && part.endsWith("</TEMP_ITALIC>")) {
      const content = part.substring(13, part.length - 14).trim()
      if (content && content.length > 0) { // Only add if content is not empty
        elements.push(React.createElement("em", { key: keyCounter++, className: "italic" }, content))
      }
    } else if (part.startsWith("<TEMP_CODE>") && part.endsWith("</TEMP_CODE>")) {
      const content = part.substring(11, part.length - 12).trim()
      if (content && content.length > 0) { // Only add if content is not empty
        elements.push(
          React.createElement(
            "code",
            { key: keyCounter++, className: "bg-gray-100 px-2 py-1 rounded text-sm font-mono" },
            content,
          ),
        )
      }
    } else if (part.trim()) {
      elements.push(React.createElement("span", { key: keyCounter++ }, part))
    }
  })

  return elements.length > 0 ? elements : [text]
}

export function parseJobMatches(jobText: string): any[] {
  try {
    // Try to parse as JSON first
    if (jobText.trim().startsWith("[") || jobText.trim().startsWith("{")) {
      const parsed = JSON.parse(jobText)
      return Array.isArray(parsed) ? parsed : [parsed]
    }
  } catch (error) {
    console.log("JSON parsing failed, attempting text parsing")
  }

  // Enhanced text parsing for agent responses
  const jobs: any[] = []
  const sections = jobText.split("---").filter((section) => section.trim())

  sections.forEach((section) => {
    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
    const job: any = {}

    lines.forEach((line) => {
      // More flexible parsing patterns
      if (line.match(/job title|title:/i)) {
        job.title = line.split(":")[1]?.trim().replace(/[*"]/g, "") || extractAfterPattern(line, /title/i)
      } else if (line.match(/company|company name:/i)) {
        job.company = line.split(":")[1]?.trim().replace(/[*"]/g, "") || extractAfterPattern(line, /company/i)
      } else if (line.match(/location:/i)) {
        job.location = line.split(":")[1]?.trim().replace(/[*"]/g, "") || extractAfterPattern(line, /location/i)
      } else if (line.match(/match percentage|match:/i)) {
        const match = line.match(/(\d+)%?/)
        job.matchPercentage = match ? Number.parseInt(match[1]) : 85
      } else if (line.match(/match reason|reason:/i)) {
        job.matchReason = line.split(":")[1]?.trim().replace(/[*"]/g, "") || extractAfterPattern(line, /reason/i)
      }
      // Handle cases where job title is just stated without "Title:" prefix
      else if (!job.title && line.match(/^(senior|lead|principal|junior|mid-level|staff)/i)) {
        job.title = line.replace(/[*"]/g, "").trim()
      }
    })

    // Only add job if it has at least a title
    if (job.title || Object.keys(job).length > 2) {
      // Set defaults for missing fields
      job.title = job.title || "Software Engineer"
      job.company = job.company || "Tech Company"
      job.location = job.location || "Remote"
      job.matchPercentage = job.matchPercentage || 85
      job.matchReason = job.matchReason || "Good match for your profile"

      jobs.push(job)
    }
  })

  // If no jobs were parsed, try line-by-line parsing
  if (jobs.length === 0) {
    const lines = jobText.split("\n").filter((line) => line.trim())
    let currentJob: any = {}

    lines.forEach((line) => {
      if (line.match(/^\d+\.|^-|^\*/)) {
        // New job entry
        if (Object.keys(currentJob).length > 0) {
          jobs.push(currentJob)
        }
        currentJob = {}
        // Extract job title from numbered/bulleted list
        const titleMatch = line.match(/(?:\d+\.|\*|-)\s*(.+)/)
        if (titleMatch) {
          currentJob.title = titleMatch[1].replace(/[*"]/g, "").trim()
        }
      } else if (line.includes(":")) {
        const [key, value] = line.split(":").map((s) => s.trim())
        if (key.match(/company/i)) currentJob.company = value.replace(/[*"]/g, "")
        if (key.match(/location/i)) currentJob.location = value.replace(/[*"]/g, "")
        if (key.match(/match|percentage/i)) {
          const match = value.match(/(\d+)/)
          currentJob.matchPercentage = match ? Number.parseInt(match[1]) : 85
        }
        if (key.match(/reason/i)) currentJob.matchReason = value.replace(/[*"]/g, "")
      }
    })

    // Add the last job
    if (Object.keys(currentJob).length > 0) {
      jobs.push(currentJob)
    }
  }

  // Ensure we have at least some jobs with proper defaults
  if (jobs.length === 0) {
    return [
      {
        title: "Software Engineer",
        company: "Tech Startup",
        location: "Remote",
        matchPercentage: 90,
        matchReason: "Perfect match for your technical skills and work preferences",
      },
      {
        title: "Senior Developer",
        company: "Growth Company",
        location: "Hybrid",
        matchPercentage: 85,
        matchReason: "Aligns with your experience level and career goals",
      },
    ]
  }

  return jobs.slice(0, 5) // Limit to 5 jobs
}

// Helper function to extract text after a pattern
function extractAfterPattern(text: string, pattern: RegExp): string {
  const match = text.match(pattern)
  if (match) {
    const index = match.index! + match[0].length
    return text
      .substring(index)
      .replace(/^[:\s-]+/, "")
      .replace(/[*"]/g, "")
      .trim()
  }
  return ""
}

// Function to split content into exactly 5 colored sections
export function splitIntoColoredSections(content: string): string[] {
  if (!content || content.trim() === '') return []

  // Clean up content first - completely remove <BOLD> tags
  const cleanContent = content
    .replace(/<\/?BOLD>/g, '') // Remove all BOLD tags
    .replace(/\[\d+\]/g, '') // Remove references
    .replace(/\[[\d,\s]+\]/g, '') // Remove reference ranges
    .replace(/<BOLD>\s*(.*?)\s*<\/BOLD>/g, '**$1**') // Convert any remaining to markdown
    .replace(/\*{3,}/g, '') // Remove excessive asterisks
    .replace(/^\*\s*/gm, '') // Remove leading asterisks
    .replace(/^\s*$/gm, '') // Remove empty lines
    .replace(/^#+\s*$/gm, '') // Remove empty headers
    .replace(/^\s*[-|:\s]*$/gm, '') // Remove separator lines
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
