interface LyzrAgentResponse {
  response: string
  session_id: string
}

interface UserFormData {
  name: string
  email: string
  responses: Array<{
    questionId: number
    answer: string
  }>
}

const LYZR_API_BASE = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
const LYZR_API_KEY = "sk-default-8dqOl0HQnZgLp6Urb0a3anctaHzaSbpP"

const AGENT_IDS = {
  INPUT_HANDLING: "6892207d6af6d228e10cbba0",
  ARCHETYPE_PROFILER: "68922121d69881079f032d5f",
  ROLE_TEAM_MATCHER: "6892225dcf286cb632be4dfa",
  FIT_SCORING: "689222aad69881079f032d61",
  HR_SUMMARY: "68922159d69881079f032d60",
}

async function callLyzrAgent(
  agentId: string,
  message: string,
  userId = "user@lyzrithm.ai",
): Promise<LyzrAgentResponse> {
  const sessionId = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  console.log(`🤖 Calling agent ${agentId}`)
  console.log(`📝 Message preview:`, message.substring(0, 300) + "...")

  const response = await fetch(LYZR_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LYZR_API_KEY,
    },
    body: JSON.stringify({
      user_id: userId,
      agent_id: agentId,
      session_id: sessionId,
      message: message,
    }),
  })

  if (!response.ok) {
    throw new Error(`Agent API call failed: ${response.statusText}`)
  }

  const data = await response.json()
  console.log(`✅ Agent ${agentId} response length:`, data.response?.length || 0)

  return {
    response: data.response || data.message || "",
    session_id: sessionId,
  }
}

export async function processUserAssessment(userData: UserFormData) {
  try {
    console.log("🚀 Starting assessment processing for:", userData.name)

    // Extract key information from responses
    const jobRole = userData.responses.find((r) => r.questionId === 1)?.answer || "Professional"
    const experience = userData.responses.find((r) => r.questionId === 2)?.answer || ""
    const location = userData.responses.find((r) => r.questionId === 3)?.answer || ""

    // Step 1: Input Handling Agent - Process raw data
    const formDataMessage = `Analyze this professional's assessment data:

CANDIDATE PROFILE:
Name: ${userData.name}
Email: ${userData.email}
Target Role: ${jobRole}
Experience Level: ${experience}
Location Preference: ${location}

DETAILED RESPONSES:
${userData.responses
  .map((r) => {
    const questionMap: Record<number, string> = {
      1: "Target Job Role",
      2: "Experience Level",
      3: "Location Preference",
      4: "Equity/ESOP Importance",
      5: "Team Preference (Global vs Local)",
      6: "Pay Structure Preference",
      7: "Working Hours Preference",
      8: "Company Size Preference",
      9: "Innovation Level Preference",
      10: "Autonomy vs Guidance Preference",
      11: "Team Culture Preference",
      12: "Freedom vs Structure Preference",
      13: "Career Growth Preference",
      14: "Work Motivation",
      15: "Work Style Preference",
      16: "Handling Ambiguity",
      17: "Manager Style Preference",
    }
    return `${questionMap[r.questionId] || `Question ${r.questionId}`}: ${r.answer}`
  })
  .join("\n")}

Please structure and normalize this data for comprehensive analysis. Focus on their specific role (${jobRole}) and technical/professional requirements.`

    const inputHandlingResult = await callLyzrAgent(AGENT_IDS.INPUT_HANDLING, formDataMessage, userData.email)

    // Step 2: Archetype Profiler Agent - Create custom profile
    const archetypeMessage = `Based on this candidate's assessment data: ${inputHandlingResult.response}

Create a detailed professional archetype analysis for this ${jobRole} candidate. 

IMPORTANT INSTRUCTIONS:
1. Start your response with a clear, concise archetype name (2-4 words maximum) - examples: "Strategic Problem Solver", "Collaborative Innovator", "Detail-Oriented Builder"
2. Do NOT include phrases like "reflecting their focus", "based on their responses", "I will structure", "Okay", or any meta-commentary
3. Do NOT repeat the input handling response or mention structuring/normalizing data
4. The archetype name should be standalone and descriptive
5. Go directly into the archetype analysis without any preamble

Please provide:
1. A unique archetype name that captures their professional essence (start immediately with this)
2. Detailed insights about their ideal work environment  
3. Their key strengths and working style preferences
4. Technical considerations relevant to ${jobRole}
5. Cultural fit indicators

Make this analysis specific to their role as a ${jobRole} and their individual responses. Start directly with the archetype name - no introduction or meta-commentary.`

    const archetypeResult = await callLyzrAgent(AGENT_IDS.ARCHETYPE_PROFILER, archetypeMessage, userData.email)

    // Step 3: Role & Team Matcher Agent - Find specific matches
    const roleMatchMessage = `Based on this ${jobRole} professional's profile: ${archetypeResult.response}

Find specific role and team matches for this candidate:

1. Identify 3-5 specific ${jobRole} roles that match their preferences
2. Consider their experience level: ${experience}
3. Match their location preference: ${location}
4. Align with their stated preferences about company size, culture, and work style
5. Provide specific job titles, not generic categories
6. Include team structures that would suit their working style
7. Consider technical requirements and growth paths for ${jobRole}

Focus on real, specific opportunities in the ${jobRole} field that align with their assessment responses.`

    const roleMatchResult = await callLyzrAgent(AGENT_IDS.ROLE_TEAM_MATCHER, roleMatchMessage, userData.email)

    // Step 4: Fit Scoring Agent - Calculate specific scores
    const fitScoringMessage = `Based on this ${jobRole} candidate's profile: ${archetypeResult.response}
And their role matches: ${roleMatchResult.response}

Calculate detailed compatibility scores (0-100%) for:

1. **Role Fit Score**: How well they match ${jobRole} positions
2. **Team Fit Score**: Compatibility with their preferred team structures  
3. **Manager Compatibility**: Match with their preferred management style
4. **Cultural Alignment**: Fit with their preferred company culture
5. **Technical Fit**: Alignment with ${jobRole} technical requirements
6. **Growth Potential**: Match with their career development preferences

Provide specific numerical scores with detailed reasoning for each category. Base scores on their actual responses, not generic assumptions.`

    const fitScoringResult = await callLyzrAgent(AGENT_IDS.FIT_SCORING, fitScoringMessage, userData.email)

    // Step 5: HR Summary Generator - Create professional summary
    const hrSummaryMessage = `Create a comprehensive HR summary for this ${jobRole} candidate:

CANDIDATE PROFILE: ${archetypeResult.response}
ROLE MATCHES: ${roleMatchResult.response}  
FIT SCORES: ${fitScoringResult.response}

Generate a professional summary including:

1. **Executive Summary**: Key highlights for HR teams
2. **Professional Archetype**: Their unique work style and preferences
3. **Technical Competency**: Relevant to ${jobRole} requirements
4. **Cultural Fit Indicators**: Specific workplace preferences
5. **Compatibility Scores**: Numerical assessments with explanations
6. **Recommended Roles**: Specific ${jobRole} positions
7. **Team Placement**: Ideal team structures and management styles
8. **Red Flags & Considerations**: Important hiring considerations
9. **Interview Focus Areas**: Key topics to explore in interviews

Make this actionable for HR professionals hiring for ${jobRole} positions.`

    const hrSummaryResult = await callLyzrAgent(AGENT_IDS.HR_SUMMARY, hrSummaryMessage, userData.email)

    console.log("✅ All agents completed successfully")

    return {
      inputHandling: inputHandlingResult,
      archetype: archetypeResult,
      roleMatches: roleMatchResult,
      fitScoring: fitScoringResult,
      hrSummary: hrSummaryResult,
    }
  } catch (error) {
    console.error("❌ Error processing user assessment:", error)
    throw error
  }
}

export async function generateJobMatches(archetype: string, jobRole: string, userEmail: string) {
  const jobMatchMessage = `Based on this candidate's archetype analysis: 

${archetype}

Find 5 specific job opportunities for a ${jobRole} professional:

For each job, provide:
- **Job Title**: Specific ${jobRole} position (e.g., "Senior Blockchain Developer", "Lead Smart Contract Engineer")
- **Company Name**: Realistic company name
- **Location**: Specific location or "Remote"
- **Match Percentage**: Realistic percentage (70-95%)
- **Match Reason**: Detailed explanation of why this role fits their profile
- **Key Requirements**: 2-3 main technical/professional requirements
- **Company Culture**: Brief description of work environment

Focus on real ${jobRole} opportunities that align with their specific preferences and experience level. Make each job distinct and relevant to their archetype.

Format as a clear list with each job separated by "---"`

  try {
    console.log(`🔍 Generating job matches for ${jobRole}`)
    const result = await callLyzrAgent(AGENT_IDS.ROLE_TEAM_MATCHER, jobMatchMessage, userEmail)
    console.log("✅ Job matches generated successfully")
    return result.response
  } catch (error) {
    console.error("❌ Error generating job matches:", error)
    throw error
  }
}
