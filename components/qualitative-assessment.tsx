"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface QualitativeAssessmentProps {
  onRiskAdjustment: (adjustment: number) => void
}

export default function QualitativeAssessment({ onRiskAdjustment }: QualitativeAssessmentProps) {
  const [factors, setFactors] = useState({
    companySize: 50, // 0-100 scale
    marketPosition: 60,
    managementQuality: 70,
    industryGrowth: 55,
    competitiveAdvantage: 65,
    financialStrength: 75,
    regulatoryRisk: 40,
    geographicRisk: 30,
    operationalRisk: 35,
    liquidityRisk: 25,
  })

  const factorDescriptions = {
    companySize: {
      name: "Company Size",
      description: "Larger companies typically have lower risk",
      low: "Small Cap",
      high: "Large Cap",
    },
    marketPosition: {
      name: "Market Position",
      description: "Market leadership and competitive positioning",
      low: "Weak Position",
      high: "Market Leader",
    },
    managementQuality: {
      name: "Management Quality",
      description: "Track record and strategic execution capability",
      low: "Poor Track Record",
      high: "Excellent Leadership",
    },
    industryGrowth: {
      name: "Industry Growth",
      description: "Growth prospects of the industry",
      low: "Declining Industry",
      high: "High Growth Industry",
    },
    competitiveAdvantage: {
      name: "Competitive Advantage",
      description: "Sustainable competitive moats",
      low: "No Moat",
      high: "Strong Moat",
    },
    financialStrength: {
      name: "Financial Strength",
      description: "Balance sheet quality and cash generation",
      low: "Weak Financials",
      high: "Strong Financials",
    },
    regulatoryRisk: {
      name: "Regulatory Risk",
      description: "Exposure to regulatory changes",
      low: "High Regulatory Risk",
      high: "Low Regulatory Risk",
    },
    geographicRisk: {
      name: "Geographic Risk",
      description: "Political and economic stability of markets",
      low: "High Geographic Risk",
      high: "Low Geographic Risk",
    },
    operationalRisk: {
      name: "Operational Risk",
      description: "Business model and operational complexity",
      low: "High Operational Risk",
      high: "Low Operational Risk",
    },
    liquidityRisk: {
      name: "Liquidity Risk",
      description: "Stock liquidity and trading volume",
      low: "Low Liquidity",
      high: "High Liquidity",
    },
  }

  const handleFactorChange = (factor: string, value: number) => {
    const newFactors = { ...factors, [factor]: value }
    setFactors(newFactors)

    // Calculate overall risk adjustment
    const riskAdjustment = calculateRiskAdjustment(newFactors)
    onRiskAdjustment(riskAdjustment)
  }

  const calculateRiskAdjustment = (factorValues: typeof factors) => {
    // Convert qualitative factors to risk premium adjustment
    const weights = {
      companySize: 0.15,
      marketPosition: 0.15,
      managementQuality: 0.12,
      industryGrowth: 0.1,
      competitiveAdvantage: 0.12,
      financialStrength: 0.15,
      regulatoryRisk: 0.08,
      geographicRisk: 0.05,
      operationalRisk: 0.05,
      liquidityRisk: 0.03,
    }

    let weightedScore = 0
    Object.entries(factorValues).forEach(([factor, value]) => {
      const weight = weights[factor as keyof typeof weights]
      // Convert 0-100 scale to risk adjustment (-2% to +2%)
      const riskContribution = ((value - 50) / 50) * -2 * weight
      weightedScore += riskContribution
    })

    return weightedScore
  }

  const resetToDefaults = () => {
    const defaultFactors = {
      companySize: 50,
      marketPosition: 60,
      managementQuality: 70,
      industryGrowth: 55,
      competitiveAdvantage: 65,
      financialStrength: 75,
      regulatoryRisk: 40,
      geographicRisk: 30,
      operationalRisk: 35,
      liquidityRisk: 25,
    }
    setFactors(defaultFactors)
    onRiskAdjustment(calculateRiskAdjustment(defaultFactors))
  }

  const overallRiskScore = calculateRiskAdjustment(factors)
  const riskLevel = overallRiskScore < -1 ? "High Risk" : overallRiskScore > 1 ? "Low Risk" : "Moderate Risk"
  const riskColor =
    overallRiskScore < -1
      ? "bg-red-100 text-red-700"
      : overallRiskScore > 1
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Qualitative Risk Assessment</CardTitle>
              <CardDescription>
                Adjust qualitative factors to dynamically influence discount rate and risk premium
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={riskColor}>
                {riskLevel} ({overallRiskScore > 0 ? "+" : ""}
                {overallRiskScore.toFixed(2)}%)
              </Badge>
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(factorDescriptions).map(([key, info]) => (
              <div key={key} className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold">{info.name}</Label>
                  <p className="text-xs text-gray-600">{info.description}</p>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[factors[key as keyof typeof factors]]}
                    onValueChange={(value) => handleFactorChange(key, value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{info.low}</span>
                    <span className="font-semibold">{factors[key as keyof typeof factors]}</span>
                    <span>{info.high}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Risk Assessment Impact</h4>
            <p className="text-blue-800 text-sm">
              Current qualitative assessment suggests a{" "}
              <strong>
                {overallRiskScore > 0 ? "+" : ""}
                {overallRiskScore.toFixed(2)}%
              </strong>{" "}
              adjustment to the discount rate.
              {overallRiskScore < 0 && " Higher risk factors increase the required return."}
              {overallRiskScore > 0 && " Lower risk factors decrease the required return."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
