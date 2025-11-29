"use client"

import { useState, useEffect, useCallback } from "react"
import StockSearch from "@/components/stock-search"
import ValuationSummaryComponent from "@/components/valuation-summary"
import DCFAnalysis from "@/components/dcf-analysis"
import ResidualIncomeAnalysis from "@/components/residual-income-analysis"
import ComparablesAnalysis from "@/components/comparables-analysis"
import DividendDiscountAnalysis from "@/components/dividend-discount-analysis"
import TechnicalAnalysis from "@/components/technical-analysis"
import AdvancedAnalytics from "@/components/advanced-analytics"
import WACCWizard from "@/components/wacc-wizard"
import PrecedentTransactions from "@/components/precedent-transactions"
import InvestmentRecommendation from "@/components/investment-recommendation"
import DataTemplateManager from "@/components/data-template-manager"
import APIDataFetcher from "@/components/api-data-fetcher"
import ScenarioAnalysis from "@/components/scenario-analysis"
import EnhancedValuationSummary from "@/components/enhanced-valuation-summary"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Download,
  Settings,
  Calculator,
  Brain,
  TrendingUp,
  BarChart3,
  LineChart,
  Award,
  Activity,
  Building2,
} from "lucide-react"

import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData } from "@/types"

// Enhanced mock data with comprehensive financial metrics
const mockStockData: StockData = {
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

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [assumptions, setAssumptions] = useState({
    discountRate: 10,
    terminalGrowthRate: 3,
    revenueGrowthRate: 5,
    marginImprovement: 0,
    costOfEquity: 12,
    riskFreeRate: 3.5,
    marketRiskPremium: 6,
    taxRate: 20,
    betaAdjustment: 1.15,
    costOfDebt: 5, // Added for WACC
    dividendGrowthRate: 3,
  })

  // Valuation results from individual components
  const [dcfValue, setDcfValue] = useState<number | undefined>(undefined)
  const [residualIncomeValue, setResidualIncomeValue] = useState<number | undefined>(undefined)
  const [comparablesValue, setComparablesValue] = useState<number | undefined>(undefined)
  const [dividendDiscountValue, setDividendDiscountValue] = useState<number | undefined>(undefined)
  const [precedentTransactionsValue, setPrecedentTransactionsValue] = useState<number | undefined>(undefined)
  const [waccValue, setWaccValue] = useState<number | undefined>(undefined)
  const [qualitativeRiskAdjustment] = useState(0)
  const [, setScenarioResults] = useState<object[]>([])
  const [templates, setTemplates] = useState<{ [key: string]: unknown }>({})
  const [valuationResult, setValuationResult] = useState<{
    dcf: number | undefined
    residualIncome: number | undefined
    comparables: number | undefined
    dividendDiscount: number | undefined
    precedentTransactions: number | undefined
    wacc: number | undefined
    average: number
  }>({
    dcf: undefined,
    residualIncome: undefined,
    comparables: undefined,
    dividendDiscount: undefined,
    precedentTransactions: undefined,
    wacc: undefined,
    average: 0,
  })

  const handleAssumptionChange = (key: string, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }))
  }

  const fetchStockData = useCallback(async (symbol: string) => {
    setIsLoading(true)
    console.log(`Fetching data for ${symbol}`)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStockData(mockStockData) // Use the comprehensive mock data
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Fetch initial data for a default stock, e.g., "PTT"
    fetchStockData("PTT")
  }, [fetchStockData])

  const updateValuationResult = useCallback((key: keyof typeof valuationResult, value: number) => {
    setValuationResult((prev) => {
      const newResults = { ...prev, [key]: value }
      const calculatedValues = [
        newResults.dcf,
        newResults.residualIncome,
        newResults.comparables,
        newResults.dividendDiscount,
        newResults.precedentTransactions,
      ].filter((val): val is number => typeof val === "number" && !isNaN(val) && isFinite(val))

      const average =
        calculatedValues.length > 0
          ? calculatedValues.reduce((sum, val) => sum + val, 0) / calculatedValues.length
          : 0

      return { ...newResults, average }
    })
  }, [])

  const handleWACCCalculated = useCallback(
    (calculatedWacc: number, breakdown: { costOfEquity: number; costOfDebt: number; taxRate: number } | null) => {
      setWaccValue(calculatedWacc)
      updateValuationResult("wacc", calculatedWacc) // Update WACC in valuation results
      
      // Update assumptions if breakdown is available
      if (breakdown) {
        setAssumptions((prev) => ({
          ...prev,
          discountRate: calculatedWacc,
          costOfEquity: breakdown.costOfEquity,
          costOfDebt: breakdown.costOfDebt,
          taxRate: breakdown.taxRate,
        }))
      } else {
        setAssumptions((prev) => ({ ...prev, discountRate: calculatedWacc }))
      }
    },
    [updateValuationResult],
  )

    const handleAPIDataFetched = useCallback((data: StockData) => {
    setStockData(data)
    // Reset valuations when new stock data is fetched
    setDcfValue(undefined)
    setResidualIncomeValue(undefined)
    setComparablesValue(undefined)
    setDividendDiscountValue(undefined)
    setPrecedentTransactionsValue(undefined)
  }, [])

  // Update valuation results when individual values change
  useEffect(() => {
    if (dcfValue !== undefined) {
      updateValuationResult("dcf", dcfValue)
    }
  }, [dcfValue, updateValuationResult])

  useEffect(() => {
    if (residualIncomeValue !== undefined) {
      updateValuationResult("residualIncome", residualIncomeValue)
    }
  }, [residualIncomeValue, updateValuationResult])

  useEffect(() => {
    if (comparablesValue !== undefined) {
      updateValuationResult("comparables", comparablesValue)
    }
  }, [comparablesValue, updateValuationResult])

  useEffect(() => {
    if (dividendDiscountValue !== undefined) {
      updateValuationResult("dividendDiscount", dividendDiscountValue)
    }
  }, [dividendDiscountValue, updateValuationResult])

  useEffect(() => {
    if (precedentTransactionsValue !== undefined) {
      updateValuationResult("precedentTransactions", precedentTransactionsValue)
    }
  }, [precedentTransactionsValue, updateValuationResult])

  const handleSaveTemplate = (newTemplate: { [key: string]: unknown }) => {
    setTemplates((prevTemplates) => ({ ...prevTemplates, ...newTemplate }))
  }

  const handleLoadTemplate = (templateName: string) => {
    return templates[templateName]
  }

  const handleDeleteTemplate = (templateName: string) => {
    setTemplates((prevTemplates) => {
      const newTemplates = { ...prevTemplates }
      delete newTemplates[templateName]
      return newTemplates
    })
  }

  // Aggregate valuation results for summary and recommendation

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Professional Stock Valuation Platform</h1>
              <p className="text-lg text-gray-600">
                Real-time API integration with scenario modeling & comprehensive analysis •
                เครื่องมือวิเคราะห์หุ้นแบบเรียลไทม์พร้อมการจำลองสถานการณ์
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Analysis
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="space-y-6">
            <StockSearch onSearch={fetchStockData} isLoading={isLoading} />
            <APIDataFetcher onDataFetched={handleAPIDataFetched} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2">
            <DataTemplateManager
              onSaveTemplate={handleSaveTemplate}
              onLoadTemplate={handleLoadTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onDataUpdate={(data) => {
                if (data.source === "api" || data.source === "file") {
                  setStockData(data.data)
                }
              }}
              templates={templates}
            />
          </div>
        </div>

        {stockData && (
          <>
            {/* Enhanced Stock Info with Working Capital Metrics */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {stockData.symbol}
                    </CardTitle>
                    <CardDescription className="text-lg">{stockData.companyName}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">฿{safeToFixed(stockData.metrics.currentPrice)}</div>
                    <div className="text-sm text-gray-500">Current Price</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Market Cap</div>
                    <div className="font-semibold">฿{safeToFixed(stockData.metrics.marketCap / 1000000000, 1)}B</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">P/E Ratio</div>
                    <div className="font-semibold">
                      {safeToFixed(stockData.metrics.priceToEarnings, 1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">ROE</div>
                    <div className="font-semibold text-green-600">
                      {safeToFixed(stockData.financials.returnOnEquity, 1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">EBITDA Margin</div>
                    <div className="font-semibold">{safeToFixed((stockData.financials.ebitda / stockData.financials.revenue) * 100, 1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Current Ratio</div>
                    <div className="font-semibold">
                      {safeToFixed(stockData.financials.currentRatio, 2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Free FCF Yield</div>
                    <div className="font-semibold">
                      {safeToFixed(
                        (safeNumber(stockData.financials.freeCashFlow) / safeNumber(stockData.metrics.marketCap, 1)) * 100,
                        1,
                      )}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Assumptions Panel with Margin Controls */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Advanced Valuation Assumptions
                </CardTitle>
                <CardDescription>
                  Adjust key assumptions including margin improvements and efficiency gains.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Discount Rate (WACC): {safeToFixed(assumptions.discountRate, 1)}%</Label>
                      <Slider
                        value={[assumptions.discountRate]}
                        onValueChange={(value) => handleAssumptionChange("discountRate", value[0])}
                        max={20}
                        min={5}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Terminal Growth Rate: {safeToFixed(assumptions.terminalGrowthRate, 0)}%</Label>
                      <Slider
                        value={[assumptions.terminalGrowthRate]}
                        onValueChange={(value) => handleAssumptionChange("terminalGrowthRate", value[0])}
                        max={6}
                        min={1}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Revenue Growth Rate: {safeToFixed(assumptions.revenueGrowthRate, 0)}%</Label>
                      <Slider
                        value={[assumptions.revenueGrowthRate]}
                        onValueChange={(value) => handleAssumptionChange("revenueGrowthRate", value[0])}
                        max={15}
                        min={-5}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>
                        Margin Improvement: {assumptions.marginImprovement > 0 ? "+" : ""}
                        {safeToFixed(assumptions.marginImprovement, 1)}%
                      </Label>
                      <Slider
                        value={[assumptions.marginImprovement]}
                        onValueChange={(value) => handleAssumptionChange("marginImprovement", value[0])}
                        max={5}
                        min={-3}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Cost of Equity: {safeToFixed(assumptions.costOfEquity, 0)}%</Label>
                      <Slider
                        value={[assumptions.costOfEquity]}
                        onValueChange={(value) => handleAssumptionChange("costOfEquity", value[0])}
                        max={20}
                        min={8}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Tax Rate: {safeToFixed(assumptions.taxRate, 0)}%</Label>
                      <Slider
                        value={[assumptions.taxRate]}
                        onValueChange={(value) => handleAssumptionChange("taxRate", value[0])}
                        max={35}
                        min={15}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Beta Adjustment: {safeToFixed(assumptions.betaAdjustment, 2)}</Label>
                      <Slider
                        value={[assumptions.betaAdjustment]}
                        onValueChange={(value) => handleAssumptionChange("betaAdjustment", value[0])}
                        max={2}
                        min={0.5}
                        step={0.05}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Risk-Free Rate: {safeToFixed(assumptions.riskFreeRate, 1)}%</Label>
                      <Slider
                        value={[assumptions.riskFreeRate]}
                        onValueChange={(value) => handleAssumptionChange("riskFreeRate", value[0])}
                        max={8}
                        min={1}
                        step={0.25}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ValuationSummaryComponent stockData={stockData} valuationResult={valuationResult} />
            <EnhancedValuationSummary stockData={stockData} valuationResult={valuationResult} />

            <InvestmentRecommendation
              stockData={stockData}
              qualitativeScore={qualitativeRiskAdjustment}
              valuationResult={valuationResult}
            />

            <Tabs defaultValue="dcf" className="w-full">
              <TabsList className="grid w-full grid-cols-6 md:grid-cols-6 lg:grid-cols-9">
                <TabsTrigger value="dcf" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> DCF
                </TabsTrigger>
                <TabsTrigger value="residual-income" className="flex items-center gap-1">
                  <Calculator className="h-3 w-3" /> ROPI
                </TabsTrigger>
                <TabsTrigger value="comparables" className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> Comparables
                </TabsTrigger>
                <TabsTrigger value="dividend-discount" className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> Dividend
                </TabsTrigger>
                <TabsTrigger value="precedent-transactions" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Transactions
                </TabsTrigger>
                <TabsTrigger value="wacc-wizard" className="flex items-center gap-1">
                  <Calculator className="h-3 w-3" /> WACC
                </TabsTrigger>
                <TabsTrigger value="technical-analysis" className="flex items-center gap-1">
                  <LineChart className="h-3 w-3" /> Technical
                </TabsTrigger>
                <TabsTrigger value="scenario-analysis" className="flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Scenarios
                </TabsTrigger>
                <TabsTrigger value="advanced-analytics" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" /> Advanced Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dcf">
                <DCFAnalysis stockData={stockData} wacc={waccValue} assumptions={assumptions} onDCFCalculated={setDcfValue} />
              </TabsContent>
              <TabsContent value="residual-income">
                <ResidualIncomeAnalysis
                  stockData={stockData}
                  wacc={waccValue}
                  assumptions={assumptions}
                  onResidualIncomeCalculated={setResidualIncomeValue}
                />
              </TabsContent>
              <TabsContent value="comparables">
                <ComparablesAnalysis stockData={stockData} onComparablesCalculated={setComparablesValue} />
              </TabsContent>
              <TabsContent value="dividend-discount">
                <DividendDiscountAnalysis
                  stockData={stockData}
                  wacc={waccValue}
                  assumptions={assumptions}
                  onDividendDiscountCalculated={setDividendDiscountValue}
                />
              </TabsContent>
              <TabsContent value="precedent-transactions">
                <PrecedentTransactions
                  stockData={stockData}
                  onPrecedentTransactionsCalculated={setPrecedentTransactionsValue}
                />
              </TabsContent>
              <TabsContent value="wacc-wizard">
                <WACCWizard stockData={stockData} assumptions={assumptions} onWACCCalculated={handleWACCCalculated} />
              </TabsContent>
              <TabsContent value="technical-analysis">
                <TechnicalAnalysis stockData={stockData} />
              </TabsContent>
              <TabsContent value="scenario-analysis">
                <ScenarioAnalysis
                  baseValuation={valuationResult.average || 0}
                  onScenarioCalculated={setScenarioResults}
                />
              </TabsContent>
              <TabsContent value="advanced-analytics">
                <AdvancedAnalytics stockData={stockData} assumptions={assumptions} />
              </TabsContent>
            </Tabs>
          </>
        )}

        {!stockData && (
          <Card className="w-full p-8 text-center text-gray-600">
            <CardTitle className="text-xl">Welcome!</CardTitle>
            <CardContent className="mt-4">
              <p>Use the search bar above or fetch live data to begin your stock analysis.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
