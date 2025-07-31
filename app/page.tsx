"use client"

import { useState, useEffect, useRef } from "react"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  ArrowRight,
  BarChart3,
  Star,
  Trophy,
  Target,
  Clock,
  Globe,
  Award,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

// Function to track WhatsApp button clicks
const trackWhatsAppClick = (buttonLocation: string) => {
  // Google Analytics 4 event
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: buttonLocation,
      value: 1,
    })
  }

  // Google Tag Manager dataLayer
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    ;(window as any).dataLayer.push({
      event: "whatsapp_click",
      event_category: "engagement",
      event_action: "click",
      event_label: buttonLocation,
      button_location: buttonLocation,
    })
  }

  console.log("WhatsApp click tracked:", buttonLocation)
}

export default function DividendCalculator() {
  const [targetIncome, setTargetIncome] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [animatedValue, setAnimatedValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  const chartRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const savingsRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const scenarios = [
    {
      name: "Investidor Passivo",
      yield: 4.54,
      color: "bg-red-500",
      icon: Target,
      description: "Apenas aporta e captura a média do mercado",
    },
    {
      name: "Investidor Reativo",
      yield: 5.58,
      color: "bg-yellow-500",
      icon: TrendingUp,
      description: "Acompanha diariamente mas opera demais, vende e compra mais que deveria",
    },
    {
      name: "Investidor Profissional Médio",
      yield: 8.0,
      color: "bg-blue-500",
      icon: Trophy,
      description:
        "Especialistas com formação e bagagem, profissionais cobiçados pelos bancos e grandes instituições financeiras",
    },
    {
      name: "Investidor na VA Capital",
      yield: 15.0,
      color: "bg-green-500",
      icon: Crown,
      description:
        "IPCA + 15% ao ano - Performance superior com estratégias exclusivas e acompanhamento personalizado da VA Capital",
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const calculateInvestments = () => {
    const monthlyTarget = Number.parseFloat(targetIncome.replace(/[^\d,]/g, "").replace(",", ".")) || 0
    const annualTarget = monthlyTarget * 12

    return scenarios.map((scenario) => ({
      ...scenario,
      monthlyTarget,
      annualTarget,
      requiredInvestment: annualTarget / (scenario.yield / 100),
    }))
  }

  const calculateTimeToGoal = () => {
    const monthlyInvestment = 1000
    const results = calculateInvestments()

    const passiveScenario = results[0]
    const vaCapitalScenario = results[3] // Nova posição da VA Capital

    const timePassive = Math.ceil(passiveScenario.requiredInvestment / (monthlyInvestment * 12))
    const timeVACapital = Math.ceil(vaCapitalScenario.requiredInvestment / (monthlyInvestment * 12))
    const timeSaved = timePassive - timeVACapital

    return {
      timePassive,
      timeVACapital,
      timeSaved: Math.max(timeSaved, 0),
    }
  }

  const handleCalculate = () => {
    if (targetIncome) {
      setShowResults(true)
    }
  }

  // Animation for the counter - only once
  useEffect(() => {
    if (visibleSections.has("about-section") && !hasAnimated) {
      setHasAnimated(true)
      const targetValue = 500000
      const duration = 1000
      const steps = 60
      const increment = targetValue / steps
      const stepDuration = duration / steps

      let currentValue = 0
      const timer = setInterval(() => {
        currentValue += increment
        if (currentValue >= targetValue) {
          setAnimatedValue(targetValue)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(currentValue))
        }
      }, stepDuration)

      return () => clearInterval(timer)
    } else if (visibleSections.has("about-section") && hasAnimated) {
      // Se já animou, garantir que o valor final seja exibido
      setAnimatedValue(500000)
    }
  }, [visibleSections, hasAnimated])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]))
        }
      })
    }, observerOptions)

    if (chartRef.current) observer.observe(chartRef.current)
    if (timeRef.current) observer.observe(timeRef.current)
    if (savingsRef.current) observer.observe(savingsRef.current)
    if (aboutRef.current) observer.observe(aboutRef.current)
    if (ctaRef.current) observer.observe(ctaRef.current)

    return () => observer.disconnect()
  }, [showResults])

  const results = calculateInvestments()
  const savings = results[0]?.requiredInvestment - results[3]?.requiredInvestment || 0 // Comparação com VA Capital
  const timeCalculation = calculateTimeToGoal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-[#1e293b] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/va-capital-logo-transparent.png"
                alt="VA Capital"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#1e293b] bg-transparent text-sm sm:text-base px-3 sm:px-4"
            >
              Contato
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1e293b] to-[#334155] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Calculadora de
            <span className="text-blue-400"> Renda Variável</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Descubra exatamente quanto capital você precisa para gerar a renda passiva dos seus sonhos através de
            dividendos
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4">
            <div className="flex items-center justify-center space-x-2 text-slate-300">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">Cálculo Preciso</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-slate-300">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">4 Cenários Diferentes</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-slate-300">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">Consultoria Especializada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-[#1e293b]/20">
            <CardHeader className="text-center bg-gradient-to-r from-[#1e293b] to-[#334155] text-white rounded-t-lg p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Calculadora de Investimentos</CardTitle>
              <CardDescription className="text-slate-300 text-sm sm:text-base">
                Preencha o valor desejado para descobrir quanto você precisa investir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-8">
              <div className="space-y-2">
                <Label htmlFor="target-income" className="text-base sm:text-lg font-semibold">
                  Quanto você quer ganhar por mês?
                </Label>
                <Input
                  id="target-income"
                  placeholder="5.000,00"
                  value={targetIncome}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "")
                    if (value) {
                      value = (Number.parseFloat(value) / 100).toFixed(2).replace(".", ",")
                      setTargetIncome(value)
                    } else {
                      setTargetIncome("")
                    }
                  }}
                  className="text-lg h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold"
                />
                <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
                  Digite apenas números (ex: 5000 para R$ 5.000,00)
                </p>
              </div>

              <Button
                onClick={handleCalculate}
                className="w-full text-base sm:text-lg py-4 sm:py-6 bg-[#1e293b] hover:bg-[#334155]"
                disabled={!targetIncome}
              >
                <Calculator className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Calcular Investimento Necessário
              </Button>

              {showResults && (
                <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-center text-[#1e293b]">Cenários de Investimento</h3>

                  {/* Scenarios Cards */}
                  <div className="grid gap-3 sm:gap-4">
                    {results.map((scenario, index) => {
                      const IconComponent = scenario.icon
                      const isVACapital = scenario.name === "Investidor na VA Capital"
                      return (
                        <Card
                          key={index}
                          className={`border-l-4 hover:shadow-lg transition-shadow ${
                            isVACapital ? "ring-2 ring-green-300 bg-green-50/30" : ""
                          }`}
                          style={{ borderLeftColor: scenario.color.replace("bg-", "") }}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <IconComponent className="h-5 w-5 text-[#1e293b]" />
                                  <h4
                                    className={`font-semibold text-base sm:text-lg ${isVACapital ? "text-green-700" : ""}`}
                                  >
                                    {scenario.name}
                                    {isVACapital && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        PREMIUM
                                      </span>
                                    )}
                                  </h4>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                  Yield médio: {scenario.yield}% ao ano
                                </p>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                  {scenario.description}
                                </p>
                              </div>
                              <div className="text-center sm:text-right flex-shrink-0">
                                <p className="text-xs sm:text-sm text-gray-600">Investimento necessário</p>
                                <p
                                  className={`text-lg sm:text-xl font-bold ${isVACapital ? "text-green-700" : "text-[#1e293b]"}`}
                                >
                                  {formatCurrency(scenario.requiredInvestment)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Enhanced Chart with Animation */}
                  <div
                    ref={chartRef}
                    id="chart-section"
                    className={`transition-all duration-1000 ${
                      visibleSections.has("chart-section") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
                      <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center text-lg sm:text-xl">
                          <BarChart3 className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                          Comparativo Visual dos Investimentos
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          Veja a diferença entre os cenários de investimento
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4 sm:space-y-6">
                          {results.map((scenario, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm sm:text-base">
                                <span className="font-medium">{scenario.name}</span>
                                <span className="font-bold">{formatCurrency(scenario.requiredInvestment)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4 sm:h-5 shadow-inner">
                                <div
                                  className={`h-4 sm:h-5 rounded-full ${scenario.color} shadow-sm transition-all duration-1000 ease-out`}
                                  style={{
                                    width: visibleSections.has("chart-section")
                                      ? `${Math.max((scenario.requiredInvestment / results[0].requiredInvestment) * 100, 10)}%`
                                      : "0%",
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Updated Time Section with VA Capital */}
                  <div
                    ref={timeRef}
                    id="time-section"
                    className={`transition-all duration-1000 delay-300 ${
                      visibleSections.has("time-section") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <Card className="bg-gradient-to-r from-orange-100 via-red-50 to-pink-50 border-2 border-orange-300 shadow-xl">
                      <CardContent className="p-4 sm:p-8 text-center">
                        <div className="mb-4">
                          <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-orange-600" />
                          <h4 className="text-xl sm:text-2xl font-bold text-orange-800 mb-2">
                            Você está perdendo tempo
                          </h4>
                        </div>
                        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-inner mb-4">
                          <p className="text-orange-700 mb-4 text-sm sm:text-base">
                            Investindo <strong>R$ 1.000,00 por mês</strong>, você levará aproximadamente:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="bg-red-100 p-3 rounded-lg">
                              <p className="text-red-800 font-bold text-lg sm:text-xl">
                                {timeCalculation.timePassive} anos
                              </p>
                              <p className="text-red-600 text-xs sm:text-sm">Como investidor passivo</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                              <p className="text-green-800 font-bold text-lg sm:text-xl">
                                {timeCalculation.timeVACapital} anos
                              </p>
                              <p className="text-green-600 text-xs sm:text-sm">Com a VA Capital</p>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-green-200 to-blue-200 p-4 rounded-lg">
                            <p className="text-gray-800 font-bold text-base sm:text-lg">
                              Com a VA Capital, podemos reduzir isso em até{" "}
                              <span className="text-green-700 text-xl sm:text-2xl">
                                {timeCalculation.timeSaved} anos
                              </span>{" "}
                              e garantir sua segurança financeira!
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Enhanced Savings Calculation with VA Capital */}
                  {savings > 0 && (
                    <div
                      ref={savingsRef}
                      id="savings-section"
                      className={`transition-all duration-1000 delay-500 ${
                        visibleSections.has("savings-section") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                    >
                      <Card className="bg-gradient-to-r from-green-100 via-green-50 to-emerald-50 border-2 border-green-300 shadow-2xl">
                        <CardContent className="p-4 sm:p-8 text-center">
                          <div className="mb-4">
                            <div className="flex justify-center items-center gap-4 mb-4">
                              <Image
                                src="/va-capital-logo-transparent.png"
                                alt="VA Capital"
                                width={80}
                                height={30}
                                className="h-8 sm:h-10 w-auto"
                              />
                            </div>
                            <h4 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
                              Economia Extraordinária com a VA Capital
                            </h4>
                          </div>
                          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-inner mb-4">
                            <p className="text-green-700 mb-2 text-sm sm:text-base">
                              Investindo com nossos especialistas (IPCA + 15%), você economiza:
                            </p>
                            <p className="text-2xl sm:text-4xl font-bold text-green-800 mb-2">
                              {formatCurrency(savings)}
                            </p>
                            <p className="text-xs sm:text-sm text-green-600">
                              Comparado ao investidor passivo tradicional
                            </p>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-green-700">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                            <span className="text-sm sm:text-base font-semibold">
                              Isso representa {((savings / results[0].requiredInvestment) * 100).toFixed(1)}% menos
                              investimento!
                            </span>
                            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* New VA Capital About Section */}
                  <div
                    ref={aboutRef}
                    id="about-section"
                    className={`transition-all duration-1000 delay-700 ${
                      visibleSections.has("about-section") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <Card className="bg-gradient-to-r from-[#1e293b] to-[#334155] text-white shadow-2xl">
                      <CardContent className="p-6 sm:p-8">
                        <div className="text-center mb-6">
                          <Image
                            src="/va-capital-logo-transparent.png"
                            alt="VA Capital"
                            width={120}
                            height={40}
                            className="h-12 sm:h-16 w-auto mx-auto mb-4"
                          />
                          <h4 className="text-xl sm:text-2xl font-bold mb-2">Conheça a VA Capital</h4>
                          <p className="text-slate-300 text-sm sm:text-base">
                            Especialistas em investimentos com resultados comprovados
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                          <div className="text-center">
                            <div className="bg-blue-500/20 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-400">+5</p>
                            <p className="text-xs sm:text-sm text-slate-300">Anos de existência</p>
                          </div>

                          <div className="text-center">
                            <div className="bg-green-500/20 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-green-400">170+</p>
                            <p className="text-xs sm:text-sm text-slate-300">Clientes mentorados</p>
                          </div>

                          <div className="text-center">
                            <div className="bg-purple-500/20 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-purple-400">8+</p>
                            <p className="text-xs sm:text-sm text-slate-300">Países de investimento</p>
                          </div>
                        </div>

                        {/* Highlighted Investment Value */}
                        <div className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30">
                          <div className="bg-yellow-500/20 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400" />
                          </div>
                          <p className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-2">
                            R$ {animatedValue.toLocaleString("pt-BR")}
                          </p>
                          <p className="text-base sm:text-lg text-slate-300 font-bold">Aportados por mês na média</p>
                        </div>

                        {/* Investment Growth Chart */}
                        <div className="mt-8">
                          <h5 className="text-lg sm:text-xl font-bold text-center mb-6 text-white">
                            Histórico de Dividendos Gerados
                          </h5>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
                            <ChartContainer
                              config={{
                                dividendos: {
                                  label: "Dividendos Totais (R$)",
                                  color: "hsl(var(--chart-1))",
                                },
                              }}
                              className="h-[350px] w-full"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={[
                                    { year: "2019", dividendos: 4.5 },
                                    { year: "2020", dividendos: 2406.63 },
                                    { year: "2021", dividendos: 11605.66 },
                                    { year: "2022", dividendos: 27023.42 },
                                    { year: "2023", dividendos: 48597.74 },
                                    { year: "2024", dividendos: 68554.52 },
                                  ]}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                                  <XAxis dataKey="year" stroke="rgba(255,255,255,0.8)" fontSize={12} />
                                  <YAxis
                                    stroke="rgba(255,255,255,0.8)"
                                    fontSize={12}
                                    tickFormatter={(value) => {
                                      if (value >= 1000) {
                                        return `R$ ${(value / 1000).toFixed(0)}k`
                                      }
                                      return `R$ ${value.toLocaleString("pt-BR")}`
                                    }}
                                  />
                                  <ChartTooltip
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        const value = payload[0].value as number
                                        return (
                                          <div className="bg-white p-3 rounded-lg shadow-lg border">
                                            <p className="font-semibold text-gray-800">{`Ano: ${label}`}</p>
                                            <p className="text-green-600 font-bold">
                                              {`Dividendos: R$ ${value.toLocaleString("pt-BR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}`}
                                            </p>
                                            {value > 1000 && (
                                              <p className="text-sm text-gray-600">
                                                {`Crescimento exponencial de ${((value / 4.5) * 100).toFixed(0)}% vs 2019`}
                                              </p>
                                            )}
                                          </div>
                                        )
                                      }
                                      return null
                                    }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="dividendos"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ fill: "#10b981", strokeWidth: 2, r: 8 }}
                                    activeDot={{ r: 10, stroke: "#10b981", strokeWidth: 3, fill: "#ffffff" }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-green-400">R$ 68.555</p>
                                <p className="text-xs sm:text-sm text-slate-300">Total 2024</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-blue-400">1.423%</p>
                                <p className="text-xs sm:text-sm text-slate-300">Crescimento vs 2019</p>
                              </div>
                              <div className="text-center col-span-2 sm:col-span-1">
                                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">R$ 158.192</p>
                                <p className="text-xs sm:text-sm text-slate-300">Total Acumulado</p>
                              </div>
                            </div>
                            <div className="mt-4 text-center">
                              <p className="text-xs sm:text-sm text-slate-300">
                                Evolução dos dividendos totais gerados pelos clientes VA Capital (2019-2024)
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* CTA Button with Enhanced Highlight - Mobile Optimized */}
                  <div
                    ref={ctaRef}
                    id="cta-section"
                    className={`text-center space-y-6 pt-8 transition-all duration-1000 delay-900 ${
                      visibleSections.has("cta-section") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-300 shadow-2xl">
                      <CardContent className="p-4 sm:p-8">
                        <div className="text-center mb-6">
                          <div className="bg-green-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                          </div>
                          <h4 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
                            Quer uma estratégia personalizada para seus investimentos?
                          </h4>
                          <p className="text-sm sm:text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                            Nossos especialistas estão prontos para ajudar você a alcançar seus objetivos financeiros
                          </p>
                        </div>

                        <a
                          href="https://api.whatsapp.com/send?phone=5519993574343&text=Vim%20da%20calculadora%20e%20gostaria%20da%20minha%20consultoria%20gratuita"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full sm:w-auto"
                          onClick={() => trackWhatsAppClick("main_cta")}
                        >
                          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-xs sm:text-lg md:text-xl px-4 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 w-full sm:w-auto leading-tight shadow-xl transform hover:scale-105 transition-all duration-300">
                            <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
                            <span className="font-bold">
                              <span className="block sm:inline">Receba uma consultoria</span>
                              <span className="block sm:inline"> gratuita da VA Capital</span>
                            </span>
                          </Button>
                        </a>

                        <div className="flex items-center justify-center space-x-2 text-green-700 mt-4">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                          <span className="text-xs sm:text-base font-semibold text-center">
                            100% Gratuito • Sem Compromisso • Especialistas Certificados
                          </span>
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-[#1e293b]">
            Por que escolher a VA Capital?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-[#1e293b]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Análise Profissional</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                IPCA + 15% com estratégias exclusivas e acompanhamento personalizado
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Resultados Superiores</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Performance consistentemente acima da média do mercado
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Suporte Dedicado</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Time de especialistas disponível para orientação personalizada
              </p>
            </div>
          </div>

          {/* Additional CTA Button in Benefits Section */}
          <a
            href="https://api.whatsapp.com/send?phone=5519993574343&text=Vim%20da%20calculadora%20e%20gostaria%20da%20minha%20consultoria%20gratuita"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto"
            onClick={() => trackWhatsAppClick("benefits_section")}
          >
            <Button className="bg-green-600 hover:bg-green-700 text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto shadow-lg">
              <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="font-semibold">Fale com nossos especialistas</span>
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e293b] text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <Image
            src="/va-capital-logo-transparent.png"
            alt="VA Capital"
            width={150}
            height={50}
            className="h-10 sm:h-12 w-auto mx-auto mb-4"
          />
          <p className="text-slate-300 mb-4 text-sm sm:text-base">
            Transformando patrimônio através de investimentos inteligentes
          </p>
          <p className="text-xs sm:text-sm text-slate-400">© 2024 VA Capital. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
