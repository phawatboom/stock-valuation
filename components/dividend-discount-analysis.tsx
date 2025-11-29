"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData, Assumptions } from "@/types"

interface DividendDiscountAnalysisProps {
  stockData?: StockData
  wacc?: number
  assumptions?: Assumptions
  onDividendDiscountCalculated: (value: number) => void
}

export default function DividendDiscountAnalysis({
  stockData,
  wacc = 0.1,
  assumptions,
  onDividendDiscountCalculated,
}: DividendDiscountAnalysisProps) {
  const initialDividendPerShare = safeNumber(stockData?.financials?.dividendsPerShare, 1.0)

  const [dividendGrowthRate, setDividendGrowthRate] = useState(
    safeNumber(assumptions?.dividendGrowthRate ?? stockData?.assumptions?.dividendGrowthRate, 3),
  )
  const [costOfEquity, setCostOfEquity] = useState(
    assumptions?.costOfEquity ? assumptions.costOfEquity : wacc * 100,
  ) // Use WACC as default cost of equity

  const [ddaPerShare, setDdaPerShare] = useState(0)

  useEffect(() => {
    setDividendGrowthRate(
      safeNumber(assumptions?.dividendGrowthRate ?? stockData?.assumptions?.dividendGrowthRate, 3),
    )
    setCostOfEquity(assumptions?.costOfEquity ? assumptions.costOfEquity : wacc * 100)
  }, [stockData, wacc, assumptions])

  const calculateDDA = useCallback(() => {
    const divGrowth = safeNumber(dividendGrowthRate) / 100
    const coe = safeNumber(costOfEquity) / 100

    let calculatedDdaValue = 0
    if (coe > divGrowth) {
      calculatedDdaValue = (initialDividendPerShare * (1 + divGrowth)) / (coe - divGrowth)
    }

    setDdaPerShare(calculatedDdaValue) // DDA value is already per share
    onDividendDiscountCalculated(calculatedDdaValue)
  }, [dividendGrowthRate, costOfEquity, initialDividendPerShare, onDividendDiscountCalculated])

  useEffect(() => {
    calculateDDA()
  }, [calculateDDA])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dividend Discount Model (DDM)</CardTitle>
        <CardDescription>Values the company based on the present value of its future dividends.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dividendGrowth">Dividend Growth Rate (%)</Label>
            <Input
              id="dividendGrowth"
              type="number"
              value={dividendGrowthRate}
              onChange={(e) => setDividendGrowthRate(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="costOfEquityDDA">Cost of Equity (%)</Label>
            <Input
              id="costOfEquityDDA"
              type="number"
              value={costOfEquity}
              onChange={(e) => setCostOfEquity(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>DDM Valuation Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Dividend Per Share (Current):</span>
              <span className="font-bold">฿{safeToFixed(initialDividendPerShare, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>DDM Value Per Share:</span>
              <span className="font-bold text-xl">฿{safeToFixed(ddaPerShare, 2)}</span>
            </div>
            {safeNumber(costOfEquity) / 100 <= safeNumber(dividendGrowthRate) / 100 && (
              <div className="text-red-500 text-sm">
                *Cost of Equity must be greater than Dividend Growth Rate for a valid DDM.
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
