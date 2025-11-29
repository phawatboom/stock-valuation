"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { safeNumber, safeToFixed } from "@/lib/utils"

interface ScenarioResult {
  name: string
  growth: string
  discount: string
  margin: string
  value: string
  impact: string
}

interface ScenarioAnalysisProps {
  baseValuation: number
  onScenarioCalculated: (scenarios: ScenarioResult[]) => void
}

export default function ScenarioAnalysis({ baseValuation, onScenarioCalculated }: ScenarioAnalysisProps) {
  const [growthRateChange, setGrowthRateChange] = useState(0) // % change
  const [discountRateChange, setDiscountRateChange] = useState(0) // % change
  const [marginChange, setMarginChange] = useState(0) // % change

  const [scenarios, setScenarios] = useState<ScenarioResult[]>([])

  const runScenarios = useCallback(() => {
    const baseGrowthRate = 0.05 // Example base growth rate
    const baseDiscountRate = 0.1 // Example base discount rate
    const baseMargin = 0.1 // Example base margin (e.g., Net Income Margin)

    const adjustedGrowthRate = baseGrowthRate * (1 + safeNumber(growthRateChange) / 100)
    const adjustedDiscountRate = baseDiscountRate * (1 + safeNumber(discountRateChange) / 100)
    const adjustedMargin = baseMargin * (1 + safeNumber(marginChange) / 100)

    // Simplified impact calculation for demonstration
    // In a real app, this would involve re-running DCF/other models with adjusted inputs
    const calculateScenarioValue = (growthAdj: number, discountAdj: number, marginAdj: number) => {
      // Simulate impact: higher growth/margin, lower discount rate -> higher value
      const value = baseValuation * (1 + growthAdj / 100) * (1 - discountAdj / 100) * (1 + marginAdj / 100)
      return safeNumber(value)
    }

    const getImpact = (scenarioValue: number) => {
      if (baseValuation === 0) return 0
      return ((scenarioValue - baseValuation) / baseValuation) * 100
    }

    const newScenarios = [
      {
        name: "Base Case",
        growth: safeToFixed(baseGrowthRate * 100, 1),
        discount: safeToFixed(baseDiscountRate * 100, 1),
        margin: safeToFixed(baseMargin * 100, 1),
        value: safeToFixed(baseValuation),
        impact: "0.00%",
      },
      {
        name: "Optimistic Scenario",
        growth: safeToFixed(adjustedGrowthRate * 100 + 1, 1), // +1% for optimistic
        discount: safeToFixed(adjustedDiscountRate * 100 - 0.5, 1), // -0.5% for optimistic
        margin: safeToFixed(adjustedMargin * 100 + 0.5, 1), // +0.5% for optimistic
        value: safeToFixed(calculateScenarioValue(growthRateChange + 1, discountRateChange - 0.5, marginChange + 0.5)),
        impact:
          safeToFixed(
            getImpact(calculateScenarioValue(growthRateChange + 1, discountRateChange - 0.5, marginChange + 0.5)),
            1,
          ) + "%",
      },
      {
        name: "Pessimistic Scenario",
        growth: safeToFixed(adjustedGrowthRate * 100 - 1, 1), // -1% for pessimistic
        discount: safeToFixed(adjustedDiscountRate * 100 + 0.5, 1), // +0.5% for pessimistic
        margin: safeToFixed(adjustedMargin * 100 - 0.5, 1), // -0.5% for pessimistic
        value: safeToFixed(calculateScenarioValue(growthRateChange - 1, discountRateChange + 0.5, marginChange - 0.5)),
        impact:
          safeToFixed(
            getImpact(calculateScenarioValue(growthRateChange - 1, discountRateChange + 0.5, marginChange - 0.5)),
            1,
          ) + "%",
      },
    ]

    setScenarios(newScenarios)
    onScenarioCalculated(newScenarios)
  }, [baseValuation, growthRateChange, discountRateChange, marginChange, onScenarioCalculated])

  useEffect(() => {
    runScenarios()
  }, [runScenarios])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scenario Analysis</CardTitle>
        <CardDescription>Evaluate how changes in key assumptions impact the valuation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="growthRateChange">Growth Rate Change (%)</Label>
            <Input
              id="growthRateChange"
              type="number"
              value={growthRateChange}
              onChange={(e) => setGrowthRateChange(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="discountRateChange">Discount Rate Change (%)</Label>
            <Input
              id="discountRateChange"
              type="number"
              value={discountRateChange}
              onChange={(e) => setDiscountRateChange(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="marginChange">Margin Change (%)</Label>
            <Input
              id="marginChange"
              type="number"
              value={marginChange}
              onChange={(e) => setMarginChange(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scenario Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Growth Rate</TableHead>
                  <TableHead>Discount Rate</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Valuation (฿)</TableHead>
                  <TableHead>Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map((scenario, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{scenario.name}</TableCell>
                    <TableCell>{scenario.growth}%</TableCell>
                    <TableCell>{scenario.discount}%</TableCell>
                    <TableCell>{scenario.margin}%</TableCell>
                    <TableCell>฿{scenario.value}</TableCell>
                    <TableCell>{scenario.impact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
