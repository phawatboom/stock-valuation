import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator } from "lucide-react"
import { safeToFixed } from "@/lib/utils"
import type { Assumptions } from "@/types"

interface AssumptionsPanelProps {
  assumptions: Assumptions
  onAssumptionChange: (key: keyof Assumptions, value: number) => void
}

export function AssumptionsPanel({ assumptions, onAssumptionChange }: AssumptionsPanelProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Advanced Valuation Assumptions
        </CardTitle>
        <CardDescription>
          Adjust key assumptions including margin improvements and efficiency gains.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Discount Rate (WACC): {safeToFixed(assumptions.discountRate, 1)}%</Label>
              <Slider
                value={[assumptions.discountRate]}
                onValueChange={(value) => onAssumptionChange("discountRate", value[0])}
                max={20}
                min={5}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Terminal Growth Rate: {safeToFixed(assumptions.terminalGrowthRate, 0)}%</Label>
              <Slider
                value={[assumptions.terminalGrowthRate]}
                onValueChange={(value) => onAssumptionChange("terminalGrowthRate", value[0])}
                max={6}
                min={1}
                step={0.5}
                className="mt-2"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Revenue Growth Rate: {safeToFixed(assumptions.revenueGrowthRate, 0)}%</Label>
              <Slider
                value={[assumptions.revenueGrowthRate]}
                onValueChange={(value) => onAssumptionChange("revenueGrowthRate", value[0])}
                max={15}
                min={-5}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div>
              <Label>
                Margin Improvement: {assumptions.marginImprovement > 0 ? "+" : ""}
                {safeToFixed(assumptions.marginImprovement, 1)}%
              </Label>
              <Slider
                value={[assumptions.marginImprovement]}
                onValueChange={(value) => onAssumptionChange("marginImprovement", value[0])}
                max={5}
                min={-3}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Cost of Equity: {safeToFixed(assumptions.costOfEquity, 0)}%</Label>
              <Slider
                value={[assumptions.costOfEquity]}
                onValueChange={(value) => onAssumptionChange("costOfEquity", value[0])}
                max={20}
                min={8}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Tax Rate: {safeToFixed(assumptions.taxRate, 0)}%</Label>
              <Slider
                value={[assumptions.taxRate]}
                onValueChange={(value) => onAssumptionChange("taxRate", value[0])}
                max={35}
                min={15}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Beta Adjustment: {safeToFixed(assumptions.betaAdjustment, 2)}</Label>
              <Slider
                value={[assumptions.betaAdjustment]}
                onValueChange={(value) => onAssumptionChange("betaAdjustment", value[0])}
                max={2}
                min={0.5}
                step={0.05}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Risk-Free Rate: {safeToFixed(assumptions.riskFreeRate, 1)}%</Label>
              <Slider
                value={[assumptions.riskFreeRate]}
                onValueChange={(value) => onAssumptionChange("riskFreeRate", value[0])}
                max={8}
                min={1}
                step={0.25}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
