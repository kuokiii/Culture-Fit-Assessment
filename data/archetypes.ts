import type { Archetype } from "@/types/assessment"

export const archetypes: Record<string, Archetype> = {
  "startup-hustler": {
    name: "Startup Hustler",
    summary: "Chaos-lover, multitasker, ownership-driven",
    description:
      "You're the kind of person who thrives in chaos, adapts fast, and takes initiative like no other. You're not just looking for a job — you're hunting for ownership, speed, and an environment where decisions are made over coffee chats, not 8-layer meetings. You excel in ambiguous situations and love wearing multiple hats.",
    keywords: [
      "fast-paced",
      "autonomy",
      "early-stage",
      "ownership",
      "async-friendly",
      "high-equity",
      "experimentation",
      "flat-structure",
    ],
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
  },
  "corporate-executor": {
    name: "Corporate Executor",
    summary: "Process-driven, values stability & clarity",
    description:
      "You thrive in structured environments with clear processes, defined career paths, and predictable outcomes. You value stability, comprehensive benefits, and well-established systems. You excel at executing within frameworks and appreciate the security that comes with established organizations and proven methodologies.",
    keywords: [
      "structured",
      "SOPs",
      "enterprise",
      "benefits",
      "career-ladder",
      "stability",
      "large-teams",
      "processes",
    ],
    gradient: "from-blue-600 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
  },
  "async-builder": {
    name: "Async Builder",
    summary: "Remote-first, deep worker, meeting-averse",
    description:
      "You're a master of asynchronous work, preferring deep focus over constant collaboration. You thrive in documentation-heavy environments where communication is thoughtful and meetings are minimal. You value flexibility, autonomy, and the ability to work across time zones without being tied to a specific schedule.",
    keywords: [
      "async",
      "documentation",
      "timezone-flexible",
      "autonomy",
      "flexible-hours",
      "remote-first",
      "deep-work",
    ],
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
  },
  "innovation-junkie": {
    name: "Innovation Junkie",
    summary: "Experimental, loves bleeding-edge tools",
    description:
      "You live for experimentation and cutting-edge technology. You're energized by rapid prototyping, fail-fast mentalities, and being the first to try new tools and methodologies. You thrive in environments that encourage creative problem-solving and aren't afraid to pivot when something isn't working.",
    keywords: [
      "prototyping",
      "fail-fast",
      "R&D",
      "AI-tools",
      "no-code",
      "hackathons",
      "experimentation",
      "bleeding-edge",
    ],
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
  "strategy-architect": {
    name: "Strategy Architect",
    summary: "Big-picture thinker, long-term planner",
    description:
      "You excel at seeing the forest through the trees, creating comprehensive strategies and long-term roadmaps. You thrive on frameworks, systematic thinking, and building scalable solutions. You're the person others turn to for strategic direction and you love connecting dots across different areas of the business.",
    keywords: [
      "OKRs",
      "frameworks",
      "planning",
      "execution",
      "roadmaps",
      "systems-thinking",
      "strategic",
      "cross-functional",
    ],
    gradient: "from-cyan-500 to-blue-500",
    bgGradient: "from-cyan-50 to-blue-50",
  },
  "people-first-operator": {
    name: "People-First Operator",
    summary: "Empathy-led, safety and belonging-focused",
    description:
      "You prioritize emotional safety, inclusive culture, and collective success over individual performance metrics. You thrive in environments that value empathy, collaboration, and work-life balance. You believe that when people feel supported and valued, they naturally produce their best work.",
    keywords: [
      "collaboration",
      "DEI",
      "HR-first",
      "emotional-safety",
      "family-vibe",
      "supportive",
      "work-life-balance",
    ],
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-50 to-pink-50",
  },
}
