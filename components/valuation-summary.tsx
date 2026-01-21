"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, Scale } from "lucide-react"
import { safeNumber, safeToFixed, formatCurrency } from "@/lib/utils"
import type { StockData } from "@/types"

interface ValuationSummaryProps {
  stockData: StockData
  valuationResult: {
    dcf?: number
    residualIncome?: number
    comparables?: number
    dividendDiscount?: number
    precedentTransactions?: number
    average?: number
    wacc?: number
  }
}

export default function ValuationSummary({ stockData, valuationResult }: ValuationSummaryProps) {
  if (!stockData || !valuationResult) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Valuation Summary</CardTitle>
          <CardDescription>Overall valuation insights for the selected stock.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No stock data or valuation results available. Please search for a stock and perform analyses.
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentPrice = safeNumber(stockData?.metrics?.currentPrice)
  const dcfValue = safeNumber(valuationResult?.dcf)
  const residualIncomeValue = safeNumber(valuationResult?.residualIncome)
  const comparablesValue = safeNumber(valuationResult?.comparables)
  const dividendDiscountValue = safeNumber(valuationResult?.dividendDiscount)
  const precedentTransactionsValue = safeNumber(valuationResult?.precedentTransactions)
  const averageValue = safeNumber(valuationResult?.average)

  const getUpside = (value: number) => {
    if (currentPrice === 0) return 0
    return ((value - currentPrice) / currentPrice) * 100
  }

  const renderMetric = (title: string, value: number, icon: React.ElementType, isCurrency = true) => (
    <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        {icon && React.createElement(icon, { className: "h-6 w-6 text-gray-500" })}
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-xl font-bold">
            {isCurrency ? formatCurrency(value, stockData?.currency) : safeToFixed(value)}
          </p>
        </div>
      </div>
      {currentPrice > 0 && (
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${getUpside(value) >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {getUpside(value) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {safeToFixed(getUpside(value), 1)}%
        </div>
      )}
    </div>
  )

  const overallStatus = (value: number) => {
    const upside = getUpside(value)
    if (upside > 15) return { status: "Undervalued", color: "bg-green-100 text-green-600" }
    if (upside < -15) return { status: "Overvalued", color: "bg-red-100 text-red-600" }
    return { status: "Fair Value", color: "bg-yellow-100 text-yellow-600" }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          Valuation Summary for {stockData.symbol}
          <Badge className={overallStatus(averageValue).color}>{overallStatus(averageValue).status}</Badge>
        </CardTitle>
        <CardDescription>Overall valuation insights for {stockData.symbol}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderMetric("Current Price", currentPrice, DollarSign)}
        {renderMetric("DCF Valuation", dcfValue, DollarSign)}
        {renderMetric("Residual Income", residualIncomeValue, DollarSign)}
        {renderMetric("Comparables", comparablesValue, Scale)}
        {renderMetric("Dividend Discount", dividendDiscountValue, DollarSign)}
        {renderMetric("Precedent Transactions", precedentTransactionsValue, DollarSign)}
        {renderMetric("Average Fair Value", averageValue, DollarSign)}
      </CardContent>
    </Card>
  )
}
