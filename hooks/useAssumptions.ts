import { useState, useCallback } from "react"
import { Assumptions } from "@/types"

const defaultAssumptions: Assumptions = {
  revenueGrowthRate: 5,
  terminalGrowthRate: 3,
  discountRate: 10,
  taxRate: 20,
  costOfEquity: 12,
  costOfDebt: 5,
  marketRiskPremium: 6,
  riskFreeRate: 3.5,
  dividendGrowthRate: 3,
  marginImprovement: 0,
  betaAdjustment: 1.15,
}

export function useAssumptions(initialAssumptions?: Partial<Assumptions>) {
  const [assumptions, setAssumptions] = useState<Assumptions>({
    ...defaultAssumptions,
    ...initialAssumptions,
  })

  const handleAssumptionChange = useCallback((key: keyof Assumptions, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateAssumptions = useCallback((newAssumptions: Partial<Assumptions>) => {
    setAssumptions((prev) => ({ ...prev, ...newAssumptions }))
  }, [])

  return {
    assumptions,
    handleAssumptionChange,
    updateAssumptions,
    setAssumptions
  }
}
