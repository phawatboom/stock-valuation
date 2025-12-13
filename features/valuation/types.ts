export interface ValuationResult {
  dcf: number | undefined
  residualIncome: number | undefined
  comparables: number | undefined
  dividendDiscount: number | undefined
  precedentTransactions: number | undefined
  wacc: number | undefined
  average: number
}
