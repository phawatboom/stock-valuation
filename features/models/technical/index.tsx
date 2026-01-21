"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { safeNumber, safeToFixed, formatCurrency } from "@/lib/utils"
import type { StockData, TechnicalIndicators } from "@/types"

interface TechnicalAnalysisProps {
  stockData?: StockData
}

export default function TechnicalAnalysis({ stockData }: TechnicalAnalysisProps) {
  const [priceData, setPriceData] = useState<{ date: string; close: number; volume: number }[]>([])
  const [technicalIndicators, setTechnicalIndicators] = useState<Partial<TechnicalIndicators>>({})

  useEffect(() => {
    if (stockData?.priceData) {
      setPriceData(
        stockData.priceData.map((d) => ({
          date: d.date,
          close: safeNumber(d.close),
          volume: safeNumber(d.volume),
        })),
      )
    }
    if (stockData?.technicalIndicators) {
      setTechnicalIndicators({
        rsi: safeNumber(stockData.technicalIndicators.rsi),
        macd: safeNumber(stockData.technicalIndicators.macd),
        sma20: safeNumber(stockData.technicalIndicators.sma20),
        sma50: safeNumber(stockData.technicalIndicators.sma50),
        sma200: safeNumber(stockData.technicalIndicators.sma200),
        bollingerUpper: safeNumber(stockData.technicalIndicators.bollingerUpper),
        bollingerLower: safeNumber(stockData.technicalIndicators.bollingerLower),
        volume: safeNumber(stockData.technicalIndicators.volume),
        avgVolume: safeNumber(stockData.technicalIndicators.avgVolume),
        beta: safeNumber(stockData.technicalIndicators.beta),
        correlation: safeNumber(stockData.technicalIndicators.correlation),
      })
    }
  }, [stockData])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Technical Analysis</CardTitle>
        <CardDescription>Analyze price trends and trading patterns.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="price" domain={['auto', 'auto']} />
                <YAxis yAxisId="volume" orientation="right" hide />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === "Volume" ? value.toLocaleString() : `${formatCurrency(value, stockData?.currency, 2)}`,
                    name
                  ]}
                />
                <Legend />
                <Area type="monotone" dataKey="close" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} name="Close Price" yAxisId="price" />
                <Bar dataKey="volume" barSize={20} fill="#413ea0" name="Volume" yAxisId="volume" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Technical Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicator</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Interpretation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>RSI (Relative Strength Index)</TableCell>
                  <TableCell>{safeToFixed(technicalIndicators.rsi, 2)}</TableCell>
                  <TableCell>
                    {safeNumber(technicalIndicators.rsi) > 70
                      ? "Overbought"
                      : safeNumber(technicalIndicators.rsi) < 30
                        ? "Oversold"
                        : "Neutral"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>MACD</TableCell>
                  <TableCell>{safeToFixed(technicalIndicators.macd, 2)}</TableCell>
                  <TableCell>
                    {(technicalIndicators.macd || 0) > 0 ? "Bullish" : (technicalIndicators.macd || 0) < 0 ? "Bearish" : "Neutral"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SMA (20-day)</TableCell>
                  <TableCell>{formatCurrency(technicalIndicators.sma20 || 0, stockData?.currency, 2)}</TableCell>
                  <TableCell>
                    {safeNumber(stockData?.metrics?.currentPrice) > (technicalIndicators.sma20 || 0) ? "Above SMA" : "Below SMA"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SMA (50-day)</TableCell>
                  <TableCell>{formatCurrency(technicalIndicators.sma50 || 0, stockData?.currency, 2)}</TableCell>
                  <TableCell>
                    {safeNumber(stockData?.metrics?.currentPrice) > (technicalIndicators.sma50 || 0) ? "Above SMA" : "Below SMA"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SMA (200-day)</TableCell>
                  <TableCell>{formatCurrency(technicalIndicators.sma200 || 0, stockData?.currency, 2)}</TableCell>
                  <TableCell>
                    {safeNumber(stockData?.metrics?.currentPrice) > (technicalIndicators.sma200 || 0) ? "Above SMA" : "Below SMA"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Beta</TableCell>
                  <TableCell>{safeToFixed(technicalIndicators.beta, 2)}</TableCell>
                  <TableCell>
                    {(technicalIndicators.beta || 0) > 1
                      ? "More Volatile"
                      : (technicalIndicators.beta || 0) < 1
                        ? "Less Volatile"
                        : "Market Aligned"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
