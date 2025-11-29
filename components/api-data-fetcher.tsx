"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { StockData } from "@/types"

interface APIDataFetcherProps {
  onDataFetched: (data: StockData) => void
  isLoading: boolean
}

export default function APIDataFetcher({ onDataFetched, isLoading }: APIDataFetcherProps) {
  const [message, setMessage] = useState("")

  const handleFetchData = async () => {
    setMessage("Fetching live data... (Simulated)")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock data for demonstration
    const mockData: StockData = {
      symbol: "PTT",
      companyName: "PTT Public Company Limited",
      sector: "Energy",
      industry: "Oil & Gas Integrated",
      lastUpdated: new Date().toISOString(),
      metrics: {
        currentPrice: 42.5,
        sharesOutstanding: 29400000000,
        marketCap: 1250000000000,
        priceToEarnings: 15.2,
        priceToBook: 1.8,
        enterpriseValue: 1650000000000,
        evToRevenue: 0.6,
        evToEbitda: 8.5,
        dividendYield: 5.88,
        beta: 1.15,
        yearHigh: 45.0,
        yearLow: 38.0,
      },
      financials: {
        revenue: 2800000000000,
        netIncome: 180000000000,
        ebitda: 280000000000,
        totalDebt: 400000000000,
        cashAndEquivalents: 200000000000,
        totalAssets: 3000000000000,
        totalEquity: 1600000000000,
        operatingCashFlow: 300000000000,
        freeCashFlow: 120000000000,
        fcfMargin: 4.29,
        grossMargin: 35,
        operatingMargin: 7.8,
        netMargin: 6.4,
        returnOnEquity: 22.5,
        returnOnAssets: 7.5,
        debtToEquity: 0.5,
        currentRatio: 1.81,
        quickRatio: 1.2,
        interestExpense: 20000000000,
        dividendsPerShare: 2.5,
      },
      assumptions: {
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
        betaAdjustment: 0,
      },
      technicalIndicators: {
        movingAverage50: 41.2,
        movingAverage200: 38.5,
        rsi: 65.2,
        macd: 0.8,
        beta: 1.15,
        volume: 50000000,
        volatility: 0.025,
        supportLevel: 40.0,
        resistanceLevel: 45.0,
        sma20: 42.0,
        sma50: 41.2,
        sma200: 38.5,
        bollingerUpper: 44.0,
        bollingerLower: 40.0,
        avgVolume: 45000000,
        correlation: 0.8,
      },
      priceData: [],
    }

    onDataFetched(mockData)
    setMessage("Live data fetched successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Live Data Fetcher
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Connect to external APIs (SET, Yahoo Finance, etc.) to get real-time market data.
          </p>
          <Button onClick={handleFetchData} disabled={isLoading} className="w-full">
            {isLoading ? "Fetching..." : "Fetch Live Data"}
          </Button>
          {message && (
            <div className={`text-sm ${message.includes("success") ? "text-green-600" : "text-blue-600"}`}>
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
