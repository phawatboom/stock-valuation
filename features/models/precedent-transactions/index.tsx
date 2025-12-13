"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { safeNumber, safeToFixed, validateNumberInput } from "@/lib/utils"
import type { StockData } from "@/types"

interface PrecedentTransactionsProps {
  stockData?: StockData
  onPrecedentTransactionsCalculated: (value: number) => void
}

export default function PrecedentTransactions({
  stockData,
  onPrecedentTransactionsCalculated,
}: PrecedentTransactionsProps) {
  const currentPrice = safeNumber(stockData?.metrics?.currentPrice, 0)
  const sharesOutstanding = safeNumber(stockData?.metrics?.sharesOutstanding, 1)
  const revenue = safeNumber(stockData?.financials?.revenue, 0)
  const netIncome = safeNumber(stockData?.financials?.netIncome, 0)
  const ebitda = safeNumber(stockData?.financials?.ebitda, 0)

  const [transactionMultiples, setTransactionMultiples] = useState({
    evRevenue: 2.5,
    evEBITDA: 12.0,
    pe: 18.0,
  })

  const [impliedValues, setImpliedValues] = useState<Array<{
    metric: string
    multiple: string
    impliedValue: string
  }>>([])
  const [averageImpliedValue, setAverageImpliedValue] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const calculatePrecedentTransactions = useCallback(() => {
    setErrors({})
    
    try {
      // Validate inputs
      if (!stockData?.financials) {
        throw new Error("Financial data is required for precedent transactions analysis")
      }

      if (currentPrice <= 0 || sharesOutstanding <= 0) {
        throw new Error("Valid current price and shares outstanding are required")
      }

      const comps: Array<{ metric: string; multiple: string; impliedValue: string }> = []
      const totalDebt = safeNumber(stockData?.financials?.totalDebt, 0)
      const cashAndEquivalents = safeNumber(stockData?.financials?.cashAndEquivalents, 0)
      // const enterpriseValue = marketCap + totalDebt - cashAndEquivalents // Unused

    // EV/Revenue
    if (revenue !== 0 && transactionMultiples.evRevenue !== 0) {
      const impliedEV = revenue * transactionMultiples.evRevenue
      const impliedEquityValue = impliedEV - totalDebt + cashAndEquivalents
      const impliedValuePerShare = sharesOutstanding > 0 ? impliedEquityValue / sharesOutstanding : 0
      comps.push({
        metric: "EV/Revenue",
        multiple: safeToFixed(transactionMultiples.evRevenue, 2),
        impliedValue: safeToFixed(impliedValuePerShare, 2),
      })
    }

    // EV/EBITDA
    if (ebitda !== 0 && transactionMultiples.evEBITDA !== 0) {
      const impliedEV = ebitda * transactionMultiples.evEBITDA
      const impliedEquityValue = impliedEV - totalDebt + cashAndEquivalents
      const impliedValuePerShare = sharesOutstanding > 0 ? impliedEquityValue / sharesOutstanding : 0
      comps.push({
        metric: "EV/EBITDA",
        multiple: safeToFixed(transactionMultiples.evEBITDA, 2),
        impliedValue: safeToFixed(impliedValuePerShare, 2),
      })
    }

    // P/E
    const eps = sharesOutstanding > 0 ? netIncome / sharesOutstanding : 0
    if (eps !== 0 && transactionMultiples.pe !== 0) {
      const impliedValuePerShare = eps * transactionMultiples.pe
      comps.push({
        metric: "P/E",
        multiple: safeToFixed(transactionMultiples.pe, 2),
        impliedValue: safeToFixed(impliedValuePerShare, 2),
      })
    }

      const validImpliedValues = comps.map((c) => safeNumber(c.impliedValue)).filter((v) => v > 0)
      const avgValue =
        validImpliedValues.length > 0
          ? validImpliedValues.reduce((sum, val) => sum + val, 0) / validImpliedValues.length
          : 0

      setImpliedValues(comps)
      setAverageImpliedValue(avgValue)
      onPrecedentTransactionsCalculated(avgValue)
    } catch (error) {
      console.error("Error in precedent transactions calculation:", error)
      setErrors({ calculation: error instanceof Error ? error.message : "Calculation failed" })
      setAverageImpliedValue(0)
      setImpliedValues([])
    }
  }, [stockData, currentPrice, sharesOutstanding, revenue, netIncome, ebitda, transactionMultiples, onPrecedentTransactionsCalculated])

  useEffect(() => {
    calculatePrecedentTransactions()
  }, [calculatePrecedentTransactions])

  const handleMultipleChange = (key: keyof typeof transactionMultiples) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const validation = validateNumberInput(value, 0, 1000)
    
    if (validation.isValid) {
      setErrors((prev) => ({ ...prev, [key]: '' }))
      setTransactionMultiples((prev) => ({
        ...prev,
        [key]: safeNumber(value),
      }))
    } else {
      setErrors((prev) => ({ ...prev, [key]: validation.error || '' }))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Precedent Transactions Analysis</CardTitle>
        <CardDescription>Estimate value based on recent acquisition multiples of similar companies.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.calculation && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{errors.calculation}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="evRevenue">EV/Revenue Multiple</Label>
            <Input
              id="evRevenue"
              type="number"
              value={transactionMultiples.evRevenue}
              onChange={handleMultipleChange("evRevenue")}
              step="0.1"
              min="0"
              max="1000"
              className={errors.evRevenue ? "border-red-500" : ""}
            />
            {errors.evRevenue && <p className="text-red-500 text-xs mt-1">{errors.evRevenue}</p>}
          </div>
          <div>
            <Label htmlFor="evEBITDA">EV/EBITDA Multiple</Label>
            <Input
              id="evEBITDA"
              type="number"
              value={transactionMultiples.evEBITDA}
              onChange={handleMultipleChange("evEBITDA")}
              step="0.1"
              min="0"
              max="1000"
              className={errors.evEBITDA ? "border-red-500" : ""}
            />
            {errors.evEBITDA && <p className="text-red-500 text-xs mt-1">{errors.evEBITDA}</p>}
          </div>
          <div>
            <Label htmlFor="pe">P/E Multiple</Label>
            <Input
              id="pe"
              type="number"
              value={transactionMultiples.pe}
              onChange={handleMultipleChange("pe")}
              step="0.1"
              min="0"
              max="1000"
              className={errors.pe ? "border-red-500" : ""}
            />
            {errors.pe && <p className="text-red-500 text-xs mt-1">{errors.pe}</p>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Precedent Transactions Valuation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Transaction Multiple</TableHead>
                  <TableHead>Implied Value Per Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impliedValues.map((comp, index) => (
                  <TableRow key={index}>
                    <TableCell>{comp.metric}</TableCell>
                    <TableCell>{comp.multiple}</TableCell>
                    <TableCell>฿{comp.impliedValue}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={2}>Average Implied Value</TableCell>
                  <TableCell>฿{safeToFixed(averageImpliedValue, 2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
