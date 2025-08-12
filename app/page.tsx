"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, ArrowRight, Sparkles, Brain, Target, Calendar, Star, TrendingUp, Shield, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InitialChoicePage() {
  const [mounted, setMounted] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleUserTypeSelect = (type: string) => {
    setSelectedType(type)
    setTimeout(() => {
      if (type === "hr") {
        router.push("/hr-dashboard")
      } else {
        router.push("/assessment")
      }
    }, 500)
  }

  const handleBookDemo = () => {
    window.open("https://hubs.ly/Q03yHHL_0", "_blank")
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms analyze your responses to determine your unique workplace personality and cultural preferences.",
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "Get matched with roles, teams, and companies that align perfectly with your work style and values.",
    },
    {
      icon: TrendingUp,
      title: "Career Growth Insights",
      description: "Receive personalized recommendations for career development and professional growth opportunities.",
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Your assessment data is protected with enterprise-grade security and privacy measures.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive insights and recommendations immediately after completing your assessment.",
    },
    {
      icon: Star,
      title: "Proven Accuracy",
      description:
        "Our assessments are validated by workplace psychology experts and trusted by leading organizations.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 text-gray-900 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x * 0.02 - 200,
            top: mousePosition.y * 0.02 - 200,
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="bg-black p-3 rounded-lg shadow-lg">
              <img
                src="/images/lyzr-logo.png"
                alt="Lyzr Logo"
                className="h-6 w-auto brightness-0 invert"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">AI Career Intelligence</div>
          </div>
          <Button
            onClick={() => handleUserTypeSelect("hr")}
            className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-black hover:to-gray-800"
          >
            <Users className="w-4 h-4 mr-2" />I am a HR
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Enhanced Lyzr Branding Badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-full text-sm mb-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
              <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-4 w-auto" />
              <span className="font-semibold">Powered by Lyzr AI Technology</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Culture Fit Assessment
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover your perfect workplace culture match and unlock opportunities that align with your values and
              work style
            </p>

            <div className="flex items-center justify-center space-x-8 mb-16">
              <div className="flex items-center space-x-2 text-gray-500">
                <Brain className="w-5 h-5" />
                <span className="text-sm font-medium">AI-Powered Analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">Precision Matching</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Instant Results</span>
              </div>
            </div>
          </div>

          {/* Start Assessment Button */}
          <div className="text-center mb-20">
            <Button
              size="lg"
              onClick={() => handleUserTypeSelect("student")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 text-xl px-12 py-8 rounded-full transition-all duration-300"
              disabled={selectedType === "student"}
            >
              {selectedType === "student" ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting Assessment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-6 h-6" />
                  <span>Start Assessment Now</span>
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </Button>
          </div>

          {/* Features Section */}
          <section className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose Culture Fit Assessment?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Our AI-powered platform provides deep insights into your workplace personality, helping you find the
                perfect cultural match for your career success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={index}
                    className="p-8 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Trusted by Professionals Worldwide</h2>
              <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
                Join thousands of professionals who have discovered their perfect workplace culture match
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">10K+</div>
                  <div className="text-lg opacity-80">Assessments Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">500+</div>
                  <div className="text-lg opacity-80">Companies Trust Us</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">95%</div>
                  <div className="text-lg opacity-80">Accuracy Rate</div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <Card className="p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm mb-8 border border-white/20">
                  <img src="/images/lyzr-logo.png" alt="Lyzr Logo" className="h-5 w-auto" />
                  <span>Powered by Lyzr AI Technology</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Culture Match?</h3>
                <p className="text-gray-100 mb-10 text-lg leading-relaxed">
                  Take our comprehensive assessment and discover workplace environments where you'll thrive. Get
                  personalized insights, job recommendations, and career guidance powered by AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button
                    size="lg"
                    onClick={() => handleUserTypeSelect("student")}
                    className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg text-lg px-8 py-6 rounded-full font-semibold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Assessment Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleBookDemo}
                    className="border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 bg-transparent text-lg px-8 py-6 rounded-full transition-all duration-300"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a Demo
                  </Button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/20">
                  <p className="text-gray-200 text-sm">
                    Join professionals from leading companies who trust Culture Fit Assessment
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}
