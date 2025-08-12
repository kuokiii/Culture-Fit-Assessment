import type { AssessmentResponse } from "@/types/assessment"

// Remove the predefined archetype scoring - let agents handle everything
export function calculateArchetypeScores(responses: AssessmentResponse[]) {
  // This function is now deprecated - agents handle all analysis
  console.log("⚠️ calculateArchetypeScores is deprecated - using Lyzr agents instead")
  return {}
}

export function getTopArchetype(scores: any) {
  // This function is now deprecated - agents handle all analysis
  console.log("⚠️ getTopArchetype is deprecated - using Lyzr agents instead")
  return {
    archetype: null,
    score: 0,
    key: "custom-agent-analysis",
  }
}

// Remove mock job generation - agents handle this now
export function generateMockJobs(archetype: string, jobRole: string, keywords: string[]) {
  console.log("⚠️ generateMockJobs is deprecated - using Lyzr agents instead")
  return []
}

// Helper function to extract job role from responses
export function extractJobRole(responses: AssessmentResponse[]): string {
  const jobRoleResponse = responses.find((r) => r.questionId === 1)
  return jobRoleResponse?.answer || "Professional"
}

// Helper function to extract experience level
export function extractExperience(responses: AssessmentResponse[]): string {
  const experienceResponse = responses.find((r) => r.questionId === 2)
  return experienceResponse?.answer || ""
}

// Helper function to extract location preference
export function extractLocation(responses: AssessmentResponse[]): string {
  const locationResponse = responses.find((r) => r.questionId === 3)
  return locationResponse?.answer || ""
}

// Helper function to format responses for agent consumption
export function formatResponsesForAgent(responses: AssessmentResponse[]): string {
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

  return responses.map((r) => `${questionMap[r.questionId] || `Question ${r.questionId}`}: ${r.answer}`).join("\n")
}
