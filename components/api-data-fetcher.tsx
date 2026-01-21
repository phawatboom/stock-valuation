"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import type { StockData } from "@/types"
import { fetchStockData } from "@/services/marketData/adapter"

interface APIDataFetcherProps {
  onDataFetched: (data: StockData) => void
  isLoading: boolean
}

export default function APIDataFetcher({ onDataFetched, isLoading }: APIDataFetcherProps) {
  const [error, setError] = useState("")

  const handleQuickLoad = async (symbol: string) => {
    setError("")
    try {
      const data = await fetchStockData(symbol)
      onDataFetched(data)
    } catch (err) {
      console.error(err)
      setError(`Failed to load ${symbol}`)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Popular Stocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Quickly load data for popular companies to test the valuation models.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleQuickLoad("AAPL")} disabled={isLoading}>
              Apple (AAPL)
            </Button>
            <Button variant="outline" onClick={() => handleQuickLoad("MSFT")} disabled={isLoading}>
              Microsoft (MSFT)
            </Button>
            <Button variant="outline" onClick={() => handleQuickLoad("TSLA")} disabled={isLoading}>
              Tesla (TSLA)
            </Button>
            <Button variant="outline" onClick={() => handleQuickLoad("NVDA")} disabled={isLoading}>
              Nvidia (NVDA)
            </Button>
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
