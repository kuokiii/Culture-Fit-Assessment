"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const quizSections = [
  {
    title: "Work Preferences",
    questions: [
      {
        id: 1,
        question: "What type of work environment energizes you most?",
        type: "chips",
        options: ["Collaborative open spaces", "Quiet focused areas", "Flexible hybrid", "Dynamic changing spaces"],
      },
      {
        id: 2,
        question: "How do you prefer to receive feedback?",
        type: "chips",
        options: ["Regular check-ins", "Formal reviews", "Real-time feedback", "Self-assessment first"],
      },
      {
        id: 3,
        question: "Your ideal work schedule flexibility:",
        type: "slider",
        min: 1,
        max: 10,
        label: "Structured → Flexible",
      },
      {
        id: 4,
        question: "When facing a complex problem, you:",
        type: "chips",
        options: ["Analyze data first", "Brainstorm with others", "Research best practices", "Trust your intuition"],
      },
    ],
  },
  {
    title: "Team Culture",
    questions: [
      {
        id: 5,
        question: "In team meetings, you typically:",
        type: "chips",
        options: ["Lead discussions", "Listen and contribute", "Ask clarifying questions", "Synthesize ideas"],
      },
      {
        id: 6,
        question: "Your preferred team size:",
        type: "chips",
        options: ["2-3 people", "4-6 people", "7-10 people", "Large teams (10+)"],
      },
      {
        id: 7,
        question: "How important is social connection at work?",
        type: "slider",
        min: 1,
        max: 10,
        label: "Task-focused → Relationship-focused",
      },
      {
        id: 8,
        question: "When conflicts arise in your team:",
        type: "chips",
        options: ["Address directly", "Seek mediation", "Find compromise", "Focus on solutions"],
      },
    ],
  },
  {
    title: "Leadership Style",
    questions: [
      {
        id: 9,
        question: "Your natural leadership approach:",
        type: "chips",
        options: ["Visionary direction", "Collaborative guidance", "Supportive coaching", "Results-driven"],
      },
      {
        id: 10,
        question: "How do you handle uncertainty?",
        type: "chips",
        options: ["Create detailed plans", "Adapt as you go", "Seek expert advice", "Trust the process"],
      },
      {
        id: 11,
        question: "Your decision-making style:",
        type: "slider",
        min: 1,
        max: 10,
        label: "Quick decisions → Thorough analysis",
      },
      {
        id: 12,
        question: "When delegating tasks, you:",
        type: "chips",
        options: ["Provide clear instructions", "Set goals, allow freedom", "Check in regularly", "Trust completely"],
      },
    ],
  },
  {
    title: "Career Goals",
    questions: [
      {
        id: 13,
        question: "What motivates you most at work?",
        type: "chips",
        options: ["Impact and purpose", "Growth and learning", "Recognition and status", "Autonomy and freedom"],
      },
      {
        id: 14,
        question: "Your ideal career trajectory:",
        type: "chips",
        options: ["Vertical advancement", "Lateral exploration", "Specialist expertise", "Entrepreneurial path"],
      },
      {
        id: 15,
        question: "Work-life integration preference:",
        type: "slider",
        min: 1,
        max: 10,
        label: "Clear boundaries → Integrated lifestyle",
      },
      {
        id: 16,
        question: "Your approach to professional development:",
        type: "chips",
        options: ["Formal training", "Mentorship", "Self-directed learning", "On-the-job experience"],
      },
      {
        id: 17,
        question: "Long-term career vision:",
        type: "chips",
        options: ["Industry leader", "Expert consultant", "Team builder", "Innovation driver"],
      },
    ],
  },
]

export default function QuizPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const router = useRouter()

  const totalQuestions = quizSections.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredQuestions = Object.keys(answers).length
  const progress = (answeredQuestions / totalQuestions) * 100

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const canProceed = () => {
    const currentQuestions = quizSections[currentSection].questions
    return currentQuestions.every((q) => answers[q.id] !== undefined)
  }

  const handleNext = () => {
    if (currentSection < quizSections.length - 1) {
      setCurrentSection((prev) => prev + 1)
    } else {
      // Quiz completed, go to processing
      router.push("/processing")
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Header */}
      <header className="p-6 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-8 w-auto" />
          </div>
          <div className="flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-full text-sm">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Lyzr Agents</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="p-6 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Section {currentSection + 1} of {quizSections.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {answeredQuestions} of {totalQuestions} questions completed
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>
      </div>

      {/* Quiz Content */}
      <main className="p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">{quizSections[currentSection].title}</h1>
            <p className="text-gray-600">Answer all questions to continue to the next section</p>
          </div>

          <div className="space-y-8">
            {quizSections[currentSection].questions.map((question, index) => (
              <Card
                key={question.id}
                className="p-6 bg-white border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-6 text-black">{question.question}</h3>

                {question.type === "chips" && (
                  <div className="flex flex-wrap gap-3">
                    {question.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question.id, option)}
                        className={`px-4 py-3 rounded-full border-2 transition-all duration-300 font-medium ${
                          answers[question.id] === option
                            ? "bg-black text-white border-black shadow-lg scale-105"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black hover:shadow-md"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "slider" && (
                  <div className="space-y-6">
                    <input
                      type="range"
                      min={question.min}
                      max={question.max}
                      value={answers[question.id] || 5}
                      onChange={(e) => handleAnswer(question.id, Number.parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{question.label?.split(" → ")[0]}</span>
                      <div className="bg-black text-white px-3 py-1 rounded-full font-bold">
                        {answers[question.id] || 5}
                      </div>
                      <span className="text-gray-500">{question.label?.split(" → ")[1]}</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-black text-white hover:bg-gray-800 shadow-lg"
          >
            {currentSection === quizSections.length - 1 ? "Complete Assessment" : "Next Section"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}
