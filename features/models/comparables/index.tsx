"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData } from "@/types"

interface ComparablesAnalysisProps {
  stockData?: StockData
  onComparablesCalculated: (value: number) => void
}

interface ComparableValue {
  metric: string
  currentMultiple: string
  industryMultiple: string
  impliedValue: string
}

export default function ComparablesAnalysis({ stockData, onComparablesCalculated }: ComparablesAnalysisProps) {
  const currentPrice = safeNumber(stockData?.metrics?.currentPrice, 0)
  const sharesOutstanding = safeNumber(stockData?.metrics?.sharesOutstanding, 1)
  const revenue = safeNumber(stockData?.financials?.revenue, 0)
  const netIncome = safeNumber(stockData?.financials?.netIncome, 0)
  const bookValue = safeNumber(stockData?.financials?.totalEquity, 0)
  const ebitda = safeNumber(stockData?.financials?.ebitda, 0)
  const totalDebt = safeNumber(stockData?.financials?.totalDebt, 0)
  const cashAndEquivalents = safeNumber(stockData?.financials?.cashAndEquivalents, 0)

  const [industryPE, setIndustryPE] = useState(15)
  const [industryPS, setIndustryPS] = useState(2)
  const [industryPB, setIndustryPB] = useState(1.5)
  const [industryEVEBITDA, setIndustryEVEBITDA] = useState(10)

  const [comparableValues, setComparableValues] = useState<ComparableValue[]>([])
  const [averageComparableValue, setAverageComparableValue] = useState(0)

  const calculateComparables = useCallback(() => {
    const eps = sharesOutstanding > 0 ? netIncome / sharesOutstanding : 0
    const revenuePerShare = sharesOutstanding > 0 ? revenue / sharesOutstanding : 0
    const bookValuePerShare = sharesOutstanding > 0 ? bookValue / sharesOutstanding : 0
    const ev = currentPrice * sharesOutstanding + totalDebt - cashAndEquivalents
    const evPerShare = sharesOutstanding > 0 ? ev / sharesOutstanding : 0
    const ebitdaPerShare = sharesOutstanding > 0 ? ebitda / sharesOutstanding : 0

    const comps = []

    // P/E Multiple
    if (eps !== 0 && industryPE !== 0) {
      comps.push({
        metric: "P/E",
        currentMultiple: safeToFixed(eps !== 0 ? currentPrice / eps : 0, 2),
        industryMultiple: safeToFixed(industryPE, 2),
        impliedValue: safeToFixed(eps * industryPE, 2),
      })
    }

    // P/S Multiple
    if (revenuePerShare !== 0 && industryPS !== 0) {
      comps.push({
        metric: "P/S",
        currentMultiple: safeToFixed(revenuePerShare !== 0 ? currentPrice / revenuePerShare : 0, 2),
        industryMultiple: safeToFixed(industryPS, 2),
        impliedValue: safeToFixed(revenuePerShare * industryPS, 2),
      })
    }

    // P/B Multiple
    if (bookValuePerShare !== 0 && industryPB !== 0) {
      comps.push({
        metric: "P/B",
        currentMultiple: safeToFixed(bookValuePerShare !== 0 ? currentPrice / bookValuePerShare : 0, 2),
        industryMultiple: safeToFixed(industryPB, 2),
        impliedValue: safeToFixed(bookValuePerShare * industryPB, 2),
      })
    }

    // EV/EBITDA Multiple
    if (ebitdaPerShare !== 0 && industryEVEBITDA !== 0) {
      comps.push({
        metric: "EV/EBITDA",
        currentMultiple: safeToFixed(ebitdaPerShare !== 0 ? evPerShare / ebitdaPerShare : 0, 2),
        industryMultiple: safeToFixed(industryEVEBITDA, 2),
        impliedValue: safeToFixed(ebitdaPerShare * industryEVEBITDA, 2),
      })
    }

    const validImpliedValues = comps.map((c) => safeNumber(c.impliedValue)).filter((v) => v > 0)
    const avgValue =
      validImpliedValues.length > 0
        ? validImpliedValues.reduce((sum, val) => sum + val, 0) / validImpliedValues.length
        : 0

    setComparableValues(comps)
    setAverageComparableValue(avgValue)
    onComparablesCalculated(avgValue)
  }, [
    sharesOutstanding,
    netIncome,
    revenue,
    bookValue,
    currentPrice,
    totalDebt,
    cashAndEquivalents,
    ebitda,
    industryPE,
    industryPS,
    industryPB,
    industryEVEBITDA,
    onComparablesCalculated,
  ])

  useEffect(() => {
    calculateComparables()
  }, [calculateComparables])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparable Company Analysis</CardTitle>
        <CardDescription>Estimate value by comparing to similar publicly traded companies.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="industryPE">Industry P/E</Label>
            <Input
              id="industryPE"
              type="number"
              value={industryPE}
              onChange={(e) => setIndustryPE(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="industryPS">Industry P/S</Label>
            <Input
              id="industryPS"
              type="number"
              value={industryPS}
              onChange={(e) => setIndustryPS(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="industryPB">Industry P/B</Label>
            <Input
              id="industryPB"
              type="number"
              value={industryPB}
              onChange={(e) => setIndustryPB(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="industryEVEBITDA">Industry EV/EBITDA</Label>
            <Input
              id="industryEVEBITDA"
              type="number"
              value={industryEVEBITDA}
              onChange={(e) => setIndustryEVEBITDA(safeNumber(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparable Valuation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Current Multiple</TableHead>
                  <TableHead>Industry Multiple</TableHead>
                  <TableHead>Implied Value Per Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparableValues.map((comp, index) => (
                  <TableRow key={index}>
                    <TableCell>{comp.metric}</TableCell>
                    <TableCell>{comp.currentMultiple}</TableCell>
                    <TableCell>{comp.industryMultiple}</TableCell>
                    <TableCell>฿{comp.impliedValue}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={3}>Average Implied Value</TableCell>
                  <TableCell>฿{safeToFixed(averageComparableValue, 2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
