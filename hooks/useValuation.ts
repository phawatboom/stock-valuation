import { useState, useCallback } from "react"
import { ValuationResult } from "@/features/valuation/types"
import { initialValuationResult, calculateValuationAverage } from "@/features/valuation/logic"

export function useValuation() {
  const [valuationResult, setValuationResult] = useState<ValuationResult>(initialValuationResult)

  const updateValuationResult = useCallback((key: keyof ValuationResult, value: number) => {
    setValuationResult((prev) => calculateValuationAverage(prev, { [key]: value }))
  }, [])

  const resetValuation = useCallback(() => {
    setValuationResult(initialValuationResult)
  }, [])

  return {
    valuationResult,
    updateValuationResult,
    resetValuation,
    setValuationResult
  }
}
