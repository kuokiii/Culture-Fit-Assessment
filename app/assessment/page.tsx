"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, User, Mail, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { assessmentQuestions } from "@/data/questions"
import type { AssessmentResponse, UserProfile } from "@/types/assessment"

export default function AssessmentPage() {
  const [step, setStep] = useState(0) // 0 = user info, 1+ = questions

  const jobRoles = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UX/UI Designer",
    "Marketing Manager",
    "Sales Representative",
    "Business Analyst",
    "DevOps Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "Data Analyst",
    "Project Manager",
    "Scrum Master",
    "Quality Assurance Engineer",
    "Cybersecurity Specialist",
    "Cloud Architect",
    "Machine Learning Engineer",
    "Digital Marketing Specialist",
    "Content Writer",
    "Graphic Designer",
    "HR Manager",
    "Financial Analyst",
    "Operations Manager",
    "Customer Success Manager",
    "Other",
  ]

  // Shuffle job roles on component mount
  const [shuffledJobRoles] = useState(() => {
    const shuffled = [...jobRoles]
    // Move "Other" to the end, then shuffle the rest
    const otherIndex = shuffled.indexOf("Other")
    if (otherIndex > -1) {
      shuffled.splice(otherIndex, 1)
    }
    // Shuffle the remaining roles
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    // Add "Other" at the end
    shuffled.push("Other")
    return shuffled
  })

  // Shuffle all question options on component mount
  const [shuffledQuestions] = useState(() => {
    return assessmentQuestions.map((question) => {
      if (question.options && question.options.length > 0) {
        // Create a copy of the question with shuffled options
        const shuffledOptions = [...question.options]
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]]
        }
        return {
          ...question,
          options: shuffledOptions,
        }
      }
      return question
    })
  })

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    jobRole: "",
    customJobRole: "",
    resume: null as File | null,
  })
  const [responses, setResponses] = useState<AssessmentResponse[]>([])
  const router = useRouter()

  const totalSteps = shuffledQuestions.length + 1 // +1 for user info
  const progress = (step / totalSteps) * 100

  const handleUserInfoSubmit = () => {
    if (userInfo.name && userInfo.email && (userInfo.jobRole || userInfo.customJobRole)) {
      setStep(1)
    }
  }

  const handleAnswer = (questionId: number, answer: string) => {
    const newResponses = responses.filter((r) => r.questionId !== questionId)
    newResponses.push({ questionId, answer })
    setResponses(newResponses)
  }

  const canProceed = () => {
    if (step === 0) {
      return userInfo.name && userInfo.email && (userInfo.jobRole || userInfo.customJobRole)
    }

    const currentQuestion = shuffledQuestions[step - 1]
    return responses.some((r) => r.questionId === currentQuestion.id)
  }

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      // Assessment completed, save data and go to processing
      const finalJobRole = userInfo.jobRole === "Other" ? userInfo.customJobRole : userInfo.jobRole

      const userProfile: UserProfile = {
        ...userInfo,
        company: "", // Remove company field
        jobRole: finalJobRole || responses.find((r) => r.questionId === 1)?.answer || "",
        experience: responses.find((r) => r.questionId === 2)?.answer || "",
        location: responses.find((r) => r.questionId === 3)?.answer || "",
        responses,
        resume: userInfo.resume,
      }

      // Store in localStorage for processing
      localStorage.setItem("userProfile", JSON.stringify(userProfile))
      router.push("/processing")
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const getCurrentAnswer = (questionId: number) => {
    return responses.find((r) => r.questionId === questionId)?.answer || ""
  }

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (canProceed()) {
          if (step === 0) {
            handleUserInfoSubmit()
          } else {
            handleNext()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [step, userInfo, responses]) // Include dependencies that affect canProceed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 text-gray-900">
      {/* Header */}
      <header className="p-6 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="bg-black p-3 rounded-lg shadow-lg">
              <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-6 w-auto brightness-0 invert" />
            </div>
            <div className="text-xs text-gray-500">Culture Fit Assessment</div>
          </div>
          <div className="flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-full text-sm">
            <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-3 w-auto brightness-0 invert" />
            <span>Lyzr Agents</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="p-6 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>
      </div>

      {/* Content */}
      <main className="p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {step === 0 ? (
            // User Information Form
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">Let's Get Started</h1>
              <p className="text-gray-600 mb-8">First, tell us a bit about yourself</p>

              <Card className="p-8 bg-white border-2 border-gray-100 shadow-lg max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Your Full Name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-black"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="email"
                      placeholder="Your Email Address (Company email preferred)"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-black"
                      required
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={userInfo.jobRole || ""}
                      onChange={(e) => setUserInfo({ ...userInfo, jobRole: e.target.value, customJobRole: "" })}
                      className="w-full h-12 text-lg border-2 border-gray-200 focus:border-black rounded-md px-3 bg-white"
                      required
                    >
                      <option value="">Select Job Role You're Looking For</option>
                      {shuffledJobRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Job Role Input - Show when "Other" is selected */}
                  {userInfo.jobRole === "Other" && (
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Please specify your job role"
                        value={userInfo.customJobRole}
                        onChange={(e) => setUserInfo({ ...userInfo, customJobRole: e.target.value })}
                        className="h-12 text-lg border-2 border-gray-200 focus:border-black"
                        required
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="relative">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 focus-within:border-black transition-colors">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500 font-medium">
                            {userInfo.resume ? userInfo.resume.name : "Upload Resume (PDF or DOCX)"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setUserInfo({ ...userInfo, resume: file })
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Upload your resume for better job matching (Optional)
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            // Assessment Questions
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">Culture Fit Assessment</h1>
              <p className="text-gray-600">Answer honestly to get the most accurate results</p>
            </div>
          )}

          {step > 0 && (
            <div className="space-y-8">
              {(() => {
                const question = shuffledQuestions[step - 1]
                const currentAnswer = getCurrentAnswer(question.id)

                return (
                  <Card
                    key={question.id}
                    className="p-8 bg-white border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 shadow-lg"
                  >
                    <h3 className="text-xl font-semibold mb-6 text-black">{question.question}</h3>

                    {question.type === "text" && (
                      <Input
                        type="text"
                        placeholder="Enter your answer..."
                        value={currentAnswer}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="h-12 text-lg border-2 border-gray-200 focus:border-black"
                        autoFocus
                      />
                    )}

                    {question.type === "radio" && question.options && (
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <label
                            key={option}
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                              currentAnswer === option
                                ? "bg-black text-white border-black shadow-lg"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md"
                            }`}
                            onClick={() => handleAnswer(question.id, option)}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={currentAnswer === option}
                              onChange={(e) => handleAnswer(question.id, e.target.value)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                currentAnswer === option ? "border-white" : "border-gray-400"
                              }`}
                            >
                              {currentAnswer === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <span className="text-base font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </Card>
                )
              })()}
            </div>
          )}

          {/* Enter hint */}
          {canProceed() && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to continue
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 0}
            className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={step === 0 ? handleUserInfoSubmit : handleNext}
            disabled={!canProceed()}
            className="bg-black text-white hover:bg-gray-800 shadow-lg"
          >
            {step === totalSteps - 1 ? "Complete Assessment" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
