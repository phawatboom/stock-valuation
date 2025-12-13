import { ValuationResult } from "./types"

export const initialValuationResult: ValuationResult = {
  dcf: undefined,
  residualIncome: undefined,
  comparables: undefined,
  dividendDiscount: undefined,
  precedentTransactions: undefined,
  wacc: undefined,
  average: 0,
}

export function calculateValuationAverage(
  currentResult: ValuationResult,
  updates: Partial<ValuationResult>
): ValuationResult {
  const newResults = { ...currentResult, ...updates }
  
  const calculatedValues = [
    newResults.dcf,
    newResults.residualIncome,
    newResults.comparables,
    newResults.dividendDiscount,
    newResults.precedentTransactions,
  ].filter((val): val is number => typeof val === "number" && !isNaN(val) && isFinite(val))

  const average =
    calculatedValues.length > 0
      ? calculatedValues.reduce((sum, val) => sum + val, 0) / calculatedValues.length
      : 0

  return { ...newResults, average }
}
