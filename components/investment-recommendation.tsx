"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData } from "@/types"

interface InvestmentRecommendationProps {
  stockData: StockData
  qualitativeScore: number
  valuationResult: {
    dcf?: number
    residualIncome?: number
    comparables?: number
    dividendDiscount?: number
    precedentTransactions?: number
    average?: number
  }
}

export default function InvestmentRecommendation({
  stockData,
  qualitativeScore,
  valuationResult,
}: InvestmentRecommendationProps) {
  if (!stockData || !valuationResult) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Investment Recommendation</CardTitle>
          <CardDescription>Overall assessment and recommendation.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading data for recommendation...</p>
        </CardContent>
      </Card>
    )
  }

  const currentPrice = safeNumber(stockData.metrics?.currentPrice)
  const averageFairValue = safeNumber(valuationResult.average)
  const marginOfSafety = currentPrice !== 0 ? ((averageFairValue - currentPrice) / currentPrice) * 100 : 0

  let recommendation = "Hold"
  let recommendationColor = "bg-yellow-500"
  let recommendationIcon = <AlertTriangle className="h-5 w-5 mr-2" />

  if (marginOfSafety > 20) {
    recommendation = "Strong Buy"
    recommendationColor = "bg-green-600"
    recommendationIcon = <CheckCircle className="h-5 w-5 mr-2" />
  } else if (marginOfSafety > 5) {
    recommendation = "Buy"
    recommendationColor = "bg-green-500"
    recommendationIcon = <CheckCircle className="h-5 w-5 mr-2" />
  } else if (marginOfSafety < -15) {
    recommendation = "Strong Sell"
    recommendationColor = "bg-red-600"
    recommendationIcon = <XCircle className="h-5 w-5 mr-2" />
  } else if (marginOfSafety < -5) {
    recommendation = "Sell"
    recommendationColor = "bg-red-500"
    recommendationIcon = <XCircle className="h-5 w-5 mr-2" />
  }

  const qualitativeImpact = qualitativeScore > 0 ? "Positive" : qualitativeScore < 0 ? "Negative" : "Neutral"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Investment Recommendation for {stockData.symbol}</CardTitle>
        <CardDescription>Overall assessment based on quantitative and qualitative factors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md"
          style={{ backgroundColor: recommendationColor }}
        >
          <div className="flex items-center text-white text-3xl font-bold mb-2">
            {recommendationIcon}
            {recommendation}
          </div>
          <p className="text-white text-lg">
            Based on an average fair value of ฿{safeToFixed(averageFairValue)} vs. current price ฿
            {safeToFixed(currentPrice)}.
          </p>
          <p className="text-white text-sm mt-1">Margin of Safety: {safeToFixed(marginOfSafety, 1)}%</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quantitative Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Current Price:</span>
                <span className="font-semibold">฿{safeToFixed(currentPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Fair Value:</span>
                <span className="font-semibold">฿{safeToFixed(averageFairValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>DCF Valuation:</span>
                <span className="font-semibold">฿{safeToFixed(safeNumber(valuationResult.dcf))}</span>
              </div>
              <div className="flex justify-between">
                <span>Residual Income:</span>
                <span className="font-semibold">฿{safeToFixed(safeNumber(valuationResult.residualIncome))}</span>
              </div>
              <div className="flex justify-between">
                <span>Comparables:</span>
                <span className="font-semibold">฿{safeToFixed(safeNumber(valuationResult.comparables))}</span>
              </div>
              <div className="flex justify-between">
                <span>Precedent Transactions:</span>
                <span className="font-semibold">฿{safeToFixed(safeNumber(valuationResult.precedentTransactions))}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Qualitative Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Qualitative Risk Adjustment:</span>
                <span className="font-semibold">{safeToFixed(qualitativeScore, 1)}%</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This adjustment reflects factors not captured in quantitative models, such as management quality, brand
                strength, industry outlook, and competitive landscape.
              </p>
              <p className="text-sm text-gray-600">
                Overall qualitative impact: <span className="font-semibold">{qualitativeImpact}</span>.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Considerations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Valuation Discrepancy:</span> The difference between the average fair
              value and the current market price is {safeToFixed(marginOfSafety, 1)}%. This indicates{" "}
              {marginOfSafety > 0 ? "potential upside" : "potential downside"} for the stock.
            </p>
            <p>
              <span className="font-semibold">Model Sensitivity:</span> DCF and Residual Income models are highly
              sensitive to growth rate and discount rate assumptions. Small changes can significantly alter the
              valuation.
            </p>
            <p>
              <span className="font-semibold">Market Conditions:</span> Current market sentiment and macroeconomic
              factors should always be considered alongside intrinsic valuations.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
