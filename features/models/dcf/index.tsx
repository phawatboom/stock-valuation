"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

import { safeNumber, safeToFixed, formatCurrency } from "@/lib/utils"
import type { StockData, Assumptions } from "@/types"

interface DCFAnalysisProps {
  stockData?: StockData
  wacc?: number
  assumptions?: Assumptions
  onDCFCalculated: (value: number) => void
}

interface Projection {
  year: string
  revenue: number
  fcf: number
  presentValue: number
}

export default function DCFAnalysis({ stockData, wacc = 0.1, assumptions, onDCFCalculated }: DCFAnalysisProps) {
  const initialRevenue = safeNumber(stockData?.financials?.revenue, 1000000000)
  const initialFCFMargin = safeNumber(stockData?.financials?.fcfMargin, 0.05) * 100 // as percentage
  const initialSharesOutstanding = safeNumber(stockData?.metrics?.sharesOutstanding, 100000000)

  const [revenueGrowthRate, setRevenueGrowthRate] = useState(
    safeNumber(assumptions?.revenueGrowthRate ?? stockData?.assumptions?.revenueGrowthRate, 5),
  )
  const [fcfMargin, setFcfMargin] = useState(initialFCFMargin + safeNumber(assumptions?.marginImprovement, 0))
  const [terminalGrowthRate, setTerminalGrowthRate] = useState(
    safeNumber(assumptions?.terminalGrowthRate ?? stockData?.assumptions?.terminalGrowthRate, 2),
  )
  const [discountRate, setDiscountRate] = useState(
    assumptions?.discountRate ? assumptions.discountRate : wacc * 100,
  ) // Use assumptions discount rate if available, else WACC

  const [projectedFCF, setProjectedFCF] = useState<Projection[]>([])
  const [dcfValue, setDcfValue] = useState(0)
  const [dcfPerShare, setDcfPerShare] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Sensitivity Analysis State
  const [sensitivityMatrix, setSensitivityMatrix] = useState<{ discount: number, growth: number, value: number }[][]>([])

  useEffect(() => {
    setRevenueGrowthRate(safeNumber(assumptions?.revenueGrowthRate ?? stockData?.assumptions?.revenueGrowthRate, 5))
    setFcfMargin(
      safeNumber(stockData?.financials?.fcfMargin, 0.05) * 100 + safeNumber(assumptions?.marginImprovement, 0),
    )
    setTerminalGrowthRate(safeNumber(assumptions?.terminalGrowthRate ?? stockData?.assumptions?.terminalGrowthRate, 2))
    setDiscountRate(assumptions?.discountRate ? assumptions.discountRate : wacc * 100)
  }, [stockData, wacc, assumptions])

  const calculateDCFValue = useCallback((revGrowth: number, fcfM: number, termGrowth: number, discRate: number) => {
      let currentRevenue = initialRevenue
      let currentFCF = currentRevenue * fcfM
      let totalPV = 0

      for (let i = 1; i <= 5; i++) {
        currentRevenue *= 1 + revGrowth
        currentFCF = currentRevenue * fcfM
        const pv = currentFCF / Math.pow(1 + discRate, i)
        totalPV += pv
      }

      const lastFCF = currentFCF
      // Guard against division by zero or negative denominator
      if (discRate <= termGrowth) return 0;
      
      const terminalValue = (lastFCF * (1 + termGrowth)) / (discRate - termGrowth)
      const terminalPV = terminalValue / Math.pow(1 + discRate, 5)
      totalPV += terminalPV
      
      return totalPV
  }, [initialRevenue])

  const calculateDCF = useCallback(() => {
    setErrors({})

    try {
      if (!stockData?.financials) throw new Error("Financial data is required")
      if (initialRevenue <= 0 || initialSharesOutstanding <= 0) throw new Error("Valid revenue/shares required")

      const revGrowth = safeNumber(revenueGrowthRate) / 100
      const fcfM = safeNumber(fcfMargin) / 100
      const termGrowth = safeNumber(terminalGrowthRate) / 100
      const discRate = safeNumber(discountRate) / 100

      if (discRate <= 0) throw new Error("Discount rate must be > 0")
      if (discRate <= termGrowth) throw new Error("Discount rate must be > terminal growth")

      // Main Calculation (Projections)
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
          revenue: currentRevenue / 1000000000,
          fcf: currentFCF / 1000000000,
          presentValue: pv / 1000000000,
        })
      }

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

      // Calculate Sensitivity Matrix
      // Rows: Terminal Growth (+/- 0.5%, 1.0%)
      // Cols: Discount Rate (+/- 0.5%, 1.0%)
      const growthSteps = [-1.0, -0.5, 0, 0.5, 1.0]
      const discountSteps = [-1.0, -0.5, 0, 0.5, 1.0]
      
      const matrix = growthSteps.map(gStep => {
        return discountSteps.map(dStep => {
          const g = termGrowth + (gStep / 100)
          const d = discRate + (dStep / 100)
          const val = calculateDCFValue(revGrowth, fcfM, g, d)
          return {
            growth: g * 100,
            discount: d * 100,
            value: val / initialSharesOutstanding
          }
        })
      })
      setSensitivityMatrix(matrix)

    } catch (error) {
      console.error("Error in DCF calculation:", error)
      setErrors({ calculation: error instanceof Error ? error.message : "DCF calculation failed" })
      setDcfValue(0)
      setDcfPerShare(0)
      setProjectedFCF([])
      setSensitivityMatrix([])
    }
  }, [
    stockData, initialRevenue, initialSharesOutstanding,
    revenueGrowthRate, fcfMargin, terminalGrowthRate, discountRate,
    onDCFCalculated, calculateDCFValue
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
                <span className="font-bold">{formatCurrency(dcfValue / 1000000000, stockData?.currency, 2)} Billion</span>
              </div>
              <div className="flex justify-between">
                <span>DCF Value Per Share:</span>
                <span className="font-bold text-xl">{formatCurrency(dcfPerShare, stockData?.currency, 2)}</span>
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
                  <Tooltip formatter={(value: number) => [`${formatCurrency(value, stockData?.currency, 2)}B`, "FCF"]} />
                  <Legend />
                  <Line type="monotone" dataKey="fcf" stroke="#8884d8" name="FCF (Billions)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sensitivity Matrix */}
        {sensitivityMatrix.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis (Value Per Share)</CardTitle>
              <CardDescription>Valuation sensitivity to Discount Rate (X-axis) and Terminal Growth (Y-axis)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center font-bold">Growth \ WACC</TableHead>
                      {sensitivityMatrix[0].map((cell, idx) => (
                        <TableHead key={idx} className="text-center">{safeToFixed(cell.discount, 1)}%</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensitivityMatrix.map((row, rIdx) => (
                      <TableRow key={rIdx}>
                        <TableCell className="font-bold text-center border-r">{safeToFixed(row[0].growth, 1)}%</TableCell>
                        {row.map((cell, cIdx) => (
                          <TableCell 
                            key={cIdx} 
                            className={`text-center ${
                              cell.value > dcfPerShare * 1.1 ? "bg-green-100 text-green-800" :
                              cell.value < dcfPerShare * 0.9 ? "bg-red-50 text-red-800" : ""
                            }`}
                          >
                            {formatCurrency(cell.value, stockData?.currency, 2)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

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
                    <TableCell>{formatCurrency(data.revenue, stockData?.currency, 2)}</TableCell>
                    <TableCell>{formatCurrency(data.fcf, stockData?.currency, 2)}</TableCell>
                    <TableCell>{formatCurrency(data.presentValue, stockData?.currency, 2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={3}>Terminal Value (PV)</TableCell>
                  <TableCell>
                    {formatCurrency(dcfValue / 1000000000 - projectedFCF.reduce((sum, p) => sum + p.presentValue, 0), stockData?.currency, 2)}
                  </TableCell>
                </TableRow>
                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={3}>Total DCF Value (PV)</TableCell>
                  <TableCell>{formatCurrency(dcfValue / 1000000000, stockData?.currency, 2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}