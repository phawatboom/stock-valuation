"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Calculator } from "lucide-react" // Correct import for Calculator icon
import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData } from "@/types"

interface WACCBreakdown {
  costOfEquity: number
  costOfDebt: number
  afterTaxCostOfDebt: number
  weightEquity: number
  weightDebt: number
  totalValue: number
}

interface WACCWizardProps {
  stockData?: StockData
  onWACCCalculated: (wacc: number, breakdown: WACCBreakdown | null) => void
}

export default function WACCWizard({ stockData, onWACCCalculated }: WACCWizardProps) {
  // Initial values based on stockData or sensible defaults
  const initialMarketValueEquity = safeNumber(stockData?.metrics?.marketCap, 100000000000) // Default to 100B
  const initialMarketValueDebt = safeNumber(stockData?.financials?.totalDebt, 50000000000) // Default to 50B
  const initialCostOfEquity = safeNumber(stockData?.assumptions?.costOfEquity, 10) // as percentage
  const initialCostOfDebt = safeNumber(stockData?.assumptions?.costOfDebt, 5) // as percentage
  const initialTaxRate = safeNumber(stockData?.assumptions?.taxRate, 21) // as percentage

  const [marketValueEquity, setMarketValueEquity] = useState(initialMarketValueEquity)
  const [marketValueDebt, setMarketValueDebt] = useState(initialMarketValueDebt)
  const [costOfEquity, setCostOfEquity] = useState(initialCostOfEquity)
  const [costOfDebt, setCostOfDebt] = useState(initialCostOfDebt)
  const [taxRate, setTaxRate] = useState(initialTaxRate)

  const [waccResult, setWaccResult] = useState(0)
  const [waccBreakdown, setWaccBreakdown] = useState<WACCBreakdown | null>(null)

  // Update state when stockData or its relevant properties change
  useEffect(() => {
    setMarketValueEquity(safeNumber(stockData?.metrics?.marketCap, 100000000000))
    setMarketValueDebt(safeNumber(stockData?.financials?.totalDebt, 50000000000))
    setCostOfEquity(safeNumber(stockData?.assumptions?.costOfEquity, 10))
    setCostOfDebt(safeNumber(stockData?.assumptions?.costOfDebt, 5))
    setTaxRate(safeNumber(stockData?.assumptions?.taxRate, 21))
  }, [stockData])

  const calculateWACC = useCallback(() => {
    const E = safeNumber(marketValueEquity)
    const D = safeNumber(marketValueDebt)
    const V = E + D // Total value of the firm

    if (V === 0) {
      setWaccResult(0)
      setWaccBreakdown(null)
      onWACCCalculated(0, null)
      return
    }

    const Re = safeNumber(costOfEquity) / 100 // Convert to decimal
    const Rd = safeNumber(costOfDebt) / 100 // Convert to decimal
    const T = safeNumber(taxRate) / 100 // Convert to decimal

    const weightEquity = E / V
    const weightDebt = D / V
    const afterTaxCostOfDebt = Rd * (1 - T)

    const calculatedWACC = weightEquity * Re + weightDebt * afterTaxCostOfDebt

    setWaccResult(calculatedWACC * 100) // Convert back to percentage for display
    const breakdown = {
      costOfEquity: Re * 100,
      costOfDebt: Rd * 100,
      afterTaxCostOfDebt: afterTaxCostOfDebt * 100,
      weightEquity: weightEquity,
      weightDebt: weightDebt,
      totalValue: V,
    }
    setWaccBreakdown(breakdown)
    onWACCCalculated(calculatedWACC * 100, breakdown)
  }, [marketValueEquity, marketValueDebt, costOfEquity, costOfDebt, taxRate, onWACCCalculated])

  // Recalculate WACC whenever inputs change
  useEffect(() => {
    calculateWACC()
  }, [calculateWACC])

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(safeNumber(e.target.value))
    }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          WACC Wizard
        </CardTitle>
        <CardDescription>Calculate the Weighted Average Cost of Capital (WACC).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="marketValueEquity">Market Value of Equity (฿)</Label>
            <Input
              id="marketValueEquity"
              type="number"
              value={marketValueEquity}
              onChange={handleInputChange(setMarketValueEquity)}
              step="1000000000"
            />
          </div>
          <div>
            <Label htmlFor="marketValueDebt">Market Value of Debt (฿)</Label>
            <Input
              id="marketValueDebt"
              type="number"
              value={marketValueDebt}
              onChange={handleInputChange(setMarketValueDebt)}
              step="1000000000"
            />
          </div>
          <div>
            <Label htmlFor="costOfEquity">Cost of Equity (%)</Label>
            <Input
              id="costOfEquity"
              type="number"
              value={costOfEquity}
              onChange={handleInputChange(setCostOfEquity)}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="costOfDebt">Cost of Debt (%)</Label>
            <Input
              id="costOfDebt"
              type="number"
              value={costOfDebt}
              onChange={handleInputChange(setCostOfDebt)}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input id="taxRate" type="number" value={taxRate} onChange={handleInputChange(setTaxRate)} step="0.1" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calculated WACC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Weighted Average Cost of Capital:</span>
              <span className="text-2xl font-bold text-blue-600">{safeToFixed(waccResult, 2)}%</span>
            </div>
            {waccBreakdown && (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Weight of Equity</TableCell>
                    <TableCell className="text-right">{safeToFixed(waccBreakdown.weightEquity * 100, 2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Weight of Debt</TableCell>
                    <TableCell className="text-right">{safeToFixed(waccBreakdown.weightDebt * 100, 2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>After-Tax Cost of Debt</TableCell>
                    <TableCell className="text-right">{safeToFixed(waccBreakdown.afterTaxCostOfDebt, 2)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
