"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { safeNumber, safeToFixed, formatCurrency } from "@/lib/utils"
import type { StockData, Assumptions } from "@/types"

interface ResidualIncomeAnalysisProps {
  stockData?: StockData
  wacc?: number
  assumptions?: Assumptions
  onResidualIncomeCalculated: (value: number) => void
}

interface Projection {
  year: string
  bookValue: number
  netIncome: number
  residualIncome: number
  presentValueRI: number
}

export default function ResidualIncomeAnalysis({
  stockData,
  wacc = 0.1,
  assumptions,
  onResidualIncomeCalculated,
}: ResidualIncomeAnalysisProps) {
  const initialBookValue = safeNumber(stockData?.financials?.totalEquity, 10000000000)
  const initialNetIncome = safeNumber(stockData?.financials?.netIncome, 1000000000)
  const initialSharesOutstanding = safeNumber(stockData?.metrics?.sharesOutstanding, 100000000)

  const [bookValueGrowthRate, setBookValueGrowthRate] = useState(
    safeNumber(assumptions?.revenueGrowthRate ?? stockData?.assumptions?.revenueGrowthRate, 5), // Using revenue growth as proxy if book value growth not available
  )
  const [roe, setRoe] = useState(safeNumber(stockData?.financials?.returnOnEquity, 0.15) * 100) // as percentage
  const [terminalGrowthRate, setTerminalGrowthRate] = useState(
    safeNumber(assumptions?.terminalGrowthRate ?? stockData?.assumptions?.terminalGrowthRate, 2),
  )
  const [costOfEquity, setCostOfEquity] = useState(
    assumptions?.costOfEquity ? assumptions.costOfEquity : wacc * 100,
  ) // Use WACC as default cost of equity

  const [projectedRI, setProjectedRI] = useState<Projection[]>([])
  const [riValue, setRiValue] = useState(0)
  const [riPerShare, setRiPerShare] = useState(0)

  useEffect(() => {
    setBookValueGrowthRate(safeNumber(assumptions?.revenueGrowthRate ?? stockData?.assumptions?.revenueGrowthRate, 5))
    setRoe(safeNumber(stockData?.financials?.returnOnEquity, 0.15) * 100)
    setTerminalGrowthRate(safeNumber(assumptions?.terminalGrowthRate ?? stockData?.assumptions?.terminalGrowthRate, 2))
    setCostOfEquity(assumptions?.costOfEquity ? assumptions.costOfEquity : wacc * 100)
  }, [stockData, wacc, assumptions])

  const calculateResidualIncome = useCallback(() => {
    const bvGrowth = safeNumber(bookValueGrowthRate) / 100
    const roeDecimal = safeNumber(roe) / 100
    const termGrowth = safeNumber(terminalGrowthRate) / 100
    const coe = safeNumber(costOfEquity) / 100

    let currentBookValue = initialBookValue
    let currentNetIncome = initialNetIncome
    let totalPVRI = 0
    const projections = []

    for (let i = 1; i <= 5; i++) {
      currentBookValue *= 1 + bvGrowth
      currentNetIncome = currentBookValue * roeDecimal // Simplified: Net Income = BV * ROE
      const requiredIncome = currentBookValue * coe
      const residualIncome = currentNetIncome - requiredIncome
      const pvRI = residualIncome / Math.pow(1 + coe, i)
      totalPVRI += pvRI
      projections.push({
        year: `Year ${i}`,
        bookValue: currentBookValue / 1000000000, // in billions
        netIncome: currentNetIncome / 1000000000, // in billions
        residualIncome: residualIncome / 1000000000, // in billions
        presentValueRI: pvRI / 1000000000, // in billions
      })
    }

    // Terminal Value of Residual Income
    let terminalRIValue = 0
    if (coe > termGrowth) {
      const lastResidualIncome = projections[projections.length - 1]?.residualIncome * 1000000000 || 0
      terminalRIValue = (lastResidualIncome * (1 + termGrowth)) / (coe - termGrowth)
    }
    const terminalPVRI = terminalRIValue / Math.pow(1 + coe, 5)
    totalPVRI += terminalPVRI

    const calculatedRiValue = initialBookValue + totalPVRI
    const calculatedRiPerShare = initialSharesOutstanding > 0 ? calculatedRiValue / initialSharesOutstanding : 0

    setProjectedRI(projections)
    setRiValue(calculatedRiValue)
    setRiPerShare(calculatedRiPerShare)
    onResidualIncomeCalculated(calculatedRiPerShare)
  }, [bookValueGrowthRate, roe, terminalGrowthRate, costOfEquity, initialBookValue, initialNetIncome, initialSharesOutstanding, onResidualIncomeCalculated])

  useEffect(() => {
    calculateResidualIncome()
  }, [calculateResidualIncome])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Residual Income Analysis</CardTitle>
        <CardDescription>
          Values the company based on its ability to generate earnings above the cost of equity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="bookValueGrowth">Book Value Growth Rate (%)</Label>
            <Input
              id="bookValueGrowth"
              type="number"
              value={bookValueGrowthRate}
              onChange={(e) => setBookValueGrowthRate(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="roe">Return on Equity (ROE) (%)</Label>
            <Input id="roe" type="number" value={roe} onChange={(e) => setRoe(safeNumber(e.target.value))} step="0.1" />
          </div>
          <div>
            <Label htmlFor="terminalGrowthRI">Terminal Growth Rate (%)</Label>
            <Input
              id="terminalGrowthRI"
              type="number"
              value={terminalGrowthRate}
              onChange={(e) => setTerminalGrowthRate(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="costOfEquityRI">Cost of Equity (%)</Label>
            <Input
              id="costOfEquityRI"
              type="number"
              value={costOfEquity}
              onChange={(e) => setCostOfEquity(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Residual Income Valuation Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total RI Value:</span>
                <span className="font-bold">{formatCurrency(riValue / 1000000000, stockData?.currency, 2)} Billion</span>
              </div>
              <div className="flex justify-between">
                <span>RI Value Per Share:</span>
                <span className="font-bold text-xl">{formatCurrency(riPerShare, stockData?.currency, 2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projected Residual Income</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={projectedRI}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${formatCurrency(value, stockData?.currency, 2)}B`, "Residual Income"]} />
                  <Legend />
                  <Line type="monotone" dataKey="residualIncome" stroke="#82ca9d" name="Residual Income (Billions)" />
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
                  <TableHead>Projected Book Value (B)</TableHead>
                  <TableHead>Projected Net Income (B)</TableHead>
                  <TableHead>Residual Income (B)</TableHead>
                  <TableHead>Present Value RI (B)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectedRI.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.year}</TableCell>
                    <TableCell>{formatCurrency(data.bookValue, stockData?.currency, 2)}</TableCell>
                    <TableCell>{formatCurrency(data.netIncome, stockData?.currency, 2)}</TableCell>
                    <TableCell>{formatCurrency(data.residualIncome, stockData?.currency, 2)}</TableCell>
                    <TableCell>{formatCurrency(data.presentValueRI, stockData?.currency, 2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={4}>Terminal Value RI (PV)</TableCell>
                  <TableCell>
                    {formatCurrency(
                      riValue / 1000000000 -
                        initialBookValue / 1000000000 -
                        projectedRI.reduce((sum, p) => sum + p.presentValueRI, 0),
                      stockData?.currency,
                      2,
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={4}>Total RI Value (PV)</TableCell>
                  <TableCell>{formatCurrency(riValue / 1000000000, stockData?.currency, 2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
