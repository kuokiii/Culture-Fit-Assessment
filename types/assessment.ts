export interface Question {
  id: number
  question: string
  type: "text" | "radio" | "chips"
  options?: string[]
  required?: boolean
}

export interface ArchetypeScore {
  [key: string]: number
}

export interface Archetype {
  name: string
  summary: string
  description: string
  keywords: string[]
  gradient: string
  bgGradient: string
}

export interface AssessmentResponse {
  questionId: number
  answer: string
}

export interface UserProfile {
  name: string
  email: string
  company: string
  jobRole: string
  experience: string
  location: string
  responses: AssessmentResponse[]
  archetype?: Archetype
  archetypeScore?: number
  resume?: File | null
}

export interface JobMatch {
  title: string
  company: string
  location: string
  link: string
  matchReason: string
  matchPercentage: number
}
