"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData } from "@/types"

interface DCFAnalysisProps {
  stockData?: StockData
  wacc?: number
  onDCFCalculated: (value: number) => void
}

interface Projection {
  year: string
  revenue: number
  fcf: number
  presentValue: number
}

export default function DCFAnalysis({ stockData, wacc = 0.1, onDCFCalculated }: DCFAnalysisProps) {
  const initialRevenue = safeNumber(stockData?.financials?.revenue, 1000000000)
  const initialFCFMargin = safeNumber(stockData?.financials?.fcfMargin, 0.05) * 100 // as percentage
  const initialSharesOutstanding = safeNumber(stockData?.metrics?.sharesOutstanding, 100000000)

  const [revenueGrowthRate, setRevenueGrowthRate] = useState(safeNumber(stockData?.assumptions?.revenueGrowthRate, 5))
  const [fcfMargin, setFcfMargin] = useState(initialFCFMargin)
  const [terminalGrowthRate, setTerminalGrowthRate] = useState(
    safeNumber(stockData?.assumptions?.terminalGrowthRate, 2),
  )
  const [discountRate, setDiscountRate] = useState(wacc * 100) // Use WACC as default discount rate

  const [projectedFCF, setProjectedFCF] = useState<Projection[]>([])
  const [dcfValue, setDcfValue] = useState(0)
  const [dcfPerShare, setDcfPerShare] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setRevenueGrowthRate(safeNumber(stockData?.assumptions?.revenueGrowthRate, 5))
    setFcfMargin(safeNumber(stockData?.financials?.fcfMargin, 0.05) * 100)
    setTerminalGrowthRate(safeNumber(stockData?.assumptions?.terminalGrowthRate, 2))
    setDiscountRate(wacc * 100)
  }, [stockData, wacc])

  const calculateDCF = useCallback(() => {
    setErrors({})

    try {
      // Validate inputs
      if (!stockData?.financials) {
        throw new Error("Financial data is required for DCF analysis")
      }

      if (initialRevenue <= 0 || initialSharesOutstanding <= 0) {
        throw new Error("Valid revenue and shares outstanding are required")
      }

      const revGrowth = safeNumber(revenueGrowthRate) / 100
      const fcfM = safeNumber(fcfMargin) / 100
      const termGrowth = safeNumber(terminalGrowthRate) / 100
      const discRate = safeNumber(discountRate) / 100

      // Validate rates
      if (discRate <= 0) {
        throw new Error("Discount rate must be greater than 0")
      }

      if (discRate <= termGrowth) {
        throw new Error("Discount rate must be greater than terminal growth rate")
      }

      if (fcfM <= 0) {
        throw new Error("FCF margin must be greater than 0")
      }

      let currentRevenue = initialRevenue
      let currentFCF = currentRevenue * fcfM
      let totalPV = 0
      const projections: Projection[] = []

      for (let i = 1; i <= 5; i++) {
        currentRevenue *= 1 + revGrowth
        currentFCF = currentRevenue * fcfM
        const pv = currentFCF / Math.pow(1 + discRate, i)
        totalPV += pv
        projections.push({
          year: `Year ${i}`,
          revenue: currentRevenue / 1000000000, // in billions
          fcf: currentFCF / 1000000000, // in billions
          presentValue: pv / 1000000000, // in billions
        })
      }

      // Terminal Value Calculation
      const lastFCF = currentFCF
      const terminalValue = (lastFCF * (1 + termGrowth)) / (discRate - termGrowth)
      const terminalPV = terminalValue / Math.pow(1 + discRate, 5)
      totalPV += terminalPV

      const calculatedDcfValue = totalPV
      const calculatedDcfPerShare = calculatedDcfValue / initialSharesOutstanding

      setProjectedFCF(projections)
      setDcfValue(calculatedDcfValue)
      setDcfPerShare(calculatedDcfPerShare)
      onDCFCalculated(calculatedDcfPerShare)
    } catch (error) {
      console.error("Error in DCF calculation:", error)
      setErrors({ calculation: error instanceof Error ? error.message : "DCF calculation failed" })
      setDcfValue(0)
      setDcfPerShare(0)
      setProjectedFCF([])
    }
  }, [
    stockData,
    initialRevenue,
    initialSharesOutstanding,
    revenueGrowthRate,
    fcfMargin,
    terminalGrowthRate,
    discountRate,
    onDCFCalculated,
  ])

  useEffect(() => {
    calculateDCF()
  }, [calculateDCF])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Discounted Cash Flow (DCF) Analysis</CardTitle>
        <CardDescription>Project future free cash flows to estimate intrinsic value.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.calculation && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{errors.calculation}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="revenueGrowth">Revenue Growth Rate (%)</Label>
            <Input
              id="revenueGrowth"
              type="number"
              value={revenueGrowthRate}
              onChange={(e) => setRevenueGrowthRate(safeNumber(e.target.value))}
              step="0.1"
              min="-50"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="fcfMargin">FCF Margin (%)</Label>
            <Input
              id="fcfMargin"
              type="number"
              value={fcfMargin}
              onChange={(e) => setFcfMargin(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="terminalGrowth">Terminal Growth Rate (%)</Label>
            <Input
              id="terminalGrowth"
              type="number"
              value={terminalGrowthRate}
              onChange={(e) => setTerminalGrowthRate(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="discountRate">Discount Rate (WACC) (%)</Label>
            <Input
              id="discountRate"
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>DCF Valuation Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total DCF Value:</span>
                <span className="font-bold">฿{safeToFixed(dcfValue / 1000000000, 2)} Billion</span>
              </div>
              <div className="flex justify-between">
                <span>DCF Value Per Share:</span>
                <span className="font-bold text-xl">฿{safeToFixed(dcfPerShare, 2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projected Free Cash Flow (FCF)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={projectedFCF}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`฿${safeToFixed(value, 2)}B`, "FCF"]} />
                  <Legend />
                  <Line type="monotone" dataKey="fcf" stroke="#8884d8" name="FCF (Billions)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Projected Revenue (B)</TableHead>
                  <TableHead>Projected FCF (B)</TableHead>
                  <TableHead>Present Value (B)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectedFCF.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.year}</TableCell>
                    <TableCell>฿{safeToFixed(data.revenue, 2)}</TableCell>
                    <TableCell>฿{safeToFixed(data.fcf, 2)}</TableCell>
                    <TableCell>฿{safeToFixed(data.presentValue, 2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={3}>Terminal Value (PV)</TableCell>
                  <TableCell>
                    ฿{safeToFixed(dcfValue / 1000000000 - projectedFCF.reduce((sum, p) => sum + p.presentValue, 0), 2)}
                  </TableCell>
                </TableRow>
                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={3}>Total DCF Value (PV)</TableCell>
                  <TableCell>฿{safeToFixed(dcfValue / 1000000000, 2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
