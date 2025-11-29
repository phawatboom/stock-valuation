"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Info, DollarSign, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData } from "@/types"

interface EnhancedValuationSummaryProps {
  stockData: StockData
  valuationResult: {
    dcf?: number
    residualIncome?: number
    comparables?: number
    dividendDiscount?: number
    precedentTransactions?: number
    average?: number
  }
}

export default function EnhancedValuationSummary({ stockData, valuationResult }: EnhancedValuationSummaryProps) {
  // Early return if essential data is missing
  if (!stockData || !stockData.metrics?.currentPrice || !valuationResult) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Enhanced Valuation Summary</CardTitle>
          <CardDescription>Detailed breakdown of valuation metrics and insights.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-gray-500">
          <Info className="h-5 w-5 mr-2" /> Loading stock data and valuation results...
        </CardContent>
      </Card>
    )
  }

  const currentPrice = safeNumber(stockData.metrics.currentPrice)

  // Safely destructure valuation results with default values
  const {
    dcf = 0,
    residualIncome = 0,
    comparables = 0,
    dividendDiscount = 0,
    average = 0,
  } = valuationResult

  // Financials with default values
  const {
    fcfMargin = 0,
    returnOnEquity: roe = 0,
    currentRatio = 0,
    debtToEquity = 0,
  } = stockData.financials || {}
  
  // Metrics
  // const {
  //   priceToEarnings: eps = 0, 
  // } = stockData.metrics || {}

  // Technical indicators with default values
  const {
    movingAverage50 = 0,
    movingAverage200 = 0,
    rsi = 0,
    macd = 0,
    beta = 0,
    volatility = 0,
  } = stockData.technicalIndicators || {}

  // Calculate upsides safely
  const calculateUpside = (valuation: number) => {
    if (currentPrice === 0) return 0
    return ((valuation - currentPrice) / currentPrice) * 100
  }

  const dcfUpside = calculateUpside(dcf)
  const residualIncomeUpside = calculateUpside(residualIncome)
  const comparablesUpside = calculateUpside(comparables)
  const dividendDiscountUpside = calculateUpside(dividendDiscount)
  const averageUpside = calculateUpside(average)

  // Key Ratios and their interpretations
  const keyRatios = [
    {
      name: "P/E Ratio",
      value: safeNumber(stockData.metrics.priceToEarnings),
      benchmark: 15,
      interpretation: (val: number) =>
        val > 20 ? "High (Potentially Overvalued)" : val < 10 ? "Low (Potentially Undervalued)" : "Moderate",
      color: (val: number) => (val > 20 ? "text-red-600" : val < 10 ? "text-green-600" : "text-yellow-600"),
    },
    {
      name: "ROE (Return on Equity)",
      value: safeNumber(roe) * 100, // Convert to percentage
      benchmark: 15,
      interpretation: (val: number) => (val > 15 ? "Strong (Efficient Management)" : "Weak (Inefficient Management)"),
      color: (val: number) => (val > 15 ? "text-green-600" : "text-red-600"),
    },
    {
      name: "Current Ratio",
      value: safeNumber(currentRatio),
      benchmark: 1.5,
      interpretation: (val: number) => (val > 1.5 ? "Healthy (Good Liquidity)" : "Weak (Liquidity Concerns)"),
      color: (val: number) => (val > 1.5 ? "text-green-600" : "text-red-600"),
    },
    {
      name: "Debt-to-Equity Ratio",
      value: safeNumber(debtToEquity),
      benchmark: 1.0,
      interpretation: (val: number) => (val < 0.5 ? "Low (Conservative)" : val > 1.0 ? "High (Leveraged)" : "Moderate"),
      color: (val: number) => (val < 0.5 ? "text-green-600" : val > 1.0 ? "text-red-600" : "text-yellow-600"),
    },
    {
      name: "FCF Margin",
      value: safeNumber(fcfMargin) * 100, // Convert to percentage
      benchmark: 10,
      interpretation: (val: number) => (val > 10 ? "Strong (Cash Generative)" : "Weak (Poor Cash Generation)"),
      color: (val: number) => (val > 10 ? "text-green-600" : "text-red-600"),
    },
  ]

  // Health check for data completeness
  const isDataComplete =
    Object.values(valuationResult).every((v) => typeof v === "number" && !isNaN(v) && v > 0) &&
    Object.values(stockData.financials || {}).every((v) => typeof v === "number" && !isNaN(v)) &&
    Object.values(stockData.technicalIndicators || {}).every((v) => typeof v === "number" && !isNaN(v))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Enhanced Valuation Summary</CardTitle>
        <CardDescription>Detailed breakdown of valuation metrics and insights.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Overall Valuation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-xl font-bold text-blue-800">฿{safeToFixed(currentPrice)}</div>
            <div className="text-sm text-blue-700">Current Market Price</div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-xl font-bold text-green-800">฿{safeToFixed(safeNumber(average))}</div>
            <div className="text-sm text-green-700">Average Fair Value</div>
          </div>
          <div
            className={`flex flex-col items-center justify-center p-4 rounded-lg ${averageUpside >= 0 ? "bg-green-50" : "bg-red-50"}`}
          >
            {averageUpside >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
            )}
            <div className={`text-xl font-bold ${averageUpside >= 0 ? "text-green-800" : "text-red-800"}`}>
              {averageUpside >= 0 ? "+" : ""}
              {safeToFixed(averageUpside, 1)}%
            </div>
            <div className={`text-sm ${averageUpside >= 0 ? "text-green-700" : "text-red-700"}`}>
              Potential Upside/Downside
            </div>
          </div>
        </div>

        {/* Valuation Method Comparison */}
        <h3 className="text-lg font-semibold mt-4">Valuation Method Comparison</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Valuation</TableHead>
              <TableHead>Upside/Downside</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">DCF Analysis</TableCell>
              <TableCell>฿{safeToFixed(dcf)}</TableCell>
              <TableCell className={dcfUpside >= 0 ? "text-green-600" : "text-red-600"}>
                {dcfUpside >= 0 ? "+" : ""}
                {safeToFixed(dcfUpside, 1)}%
              </TableCell>
              <TableCell>
                {safeNumber(dcf) > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Residual Income</TableCell>
              <TableCell>฿{safeToFixed(residualIncome)}</TableCell>
              <TableCell className={residualIncomeUpside >= 0 ? "text-green-600" : "text-red-600"}>
                {residualIncomeUpside >= 0 ? "+" : ""}
                {safeToFixed(residualIncomeUpside, 1)}%
              </TableCell>
              <TableCell>
                {safeNumber(residualIncome) > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Comparables Analysis</TableCell>
              <TableCell>฿{safeToFixed(comparables)}</TableCell>
              <TableCell className={comparablesUpside >= 0 ? "text-green-600" : "text-red-600"}>
                {comparablesUpside >= 0 ? "+" : ""}
                {safeToFixed(comparablesUpside, 1)}%
              </TableCell>
              <TableCell>
                {safeNumber(comparables) > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Dividend Discount</TableCell>
              <TableCell>฿{safeToFixed(dividendDiscount)}</TableCell>
              <TableCell className={dividendDiscountUpside >= 0 ? "text-green-600" : "text-red-600"}>
                {dividendDiscountUpside >= 0 ? "+" : ""}
                {safeToFixed(dividendDiscountUpside, 1)}%
              </TableCell>
              <TableCell>
                {safeNumber(dividendDiscount) > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Key Financial Ratios */}
        <h3 className="text-lg font-semibold mt-4">Key Financial Ratios</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ratio</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Interpretation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keyRatios.map((ratio, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{ratio.name}</TableCell>
                <TableCell className={ratio.color(ratio.value)}>
                  {safeToFixed(ratio.value, ratio.name.includes("Ratio") ? 2 : 1)}
                  {ratio.name.includes("ROE") || ratio.name.includes("FCF") ? "%" : ""}
                </TableCell>
                <TableCell className={ratio.color(ratio.value)}>{ratio.interpretation(ratio.value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Technical Indicators Snapshot */}
        <h3 className="text-lg font-semibold mt-4">Technical Indicators Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-gray-500">50-Day Moving Average</span>
            <span className="font-bold text-lg">฿{safeToFixed(movingAverage50)}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-gray-500">200-Day Moving Average</span>
            <span className="font-bold text-lg">฿{safeToFixed(movingAverage200)}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-gray-500">RSI (Relative Strength Index)</span>
            <span className="font-bold text-lg">{safeToFixed(rsi, 1)}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-gray-500">MACD</span>
            <span className="font-bold text-lg">{safeToFixed(macd, 2)}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-gray-500">Beta</span>
            <span className="font-bold text-lg">{safeToFixed(beta, 2)}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-gray-500">Volatility</span>
            <span className="font-bold text-lg">{safeToFixed(volatility * 100, 2)}%</span>
          </div>
        </div>

        {/* Data Completeness Check */}
        <div
          className={`flex items-center p-4 rounded-lg ${isDataComplete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
        >
          {isDataComplete ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
          <span className="text-sm">
            {isDataComplete
              ? "All required data for comprehensive analysis is available."
              : "Some data points are missing or invalid, which may affect the accuracy of the analysis."}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
