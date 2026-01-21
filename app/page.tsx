"use client"

import { useState, useEffect, useCallback } from "react"
import StockSearch from "@/components/stock-search"
import ValuationSummaryComponent from "@/components/valuation-summary"
import DCFAnalysis from "@/features/models/dcf"
import ResidualIncomeAnalysis from "@/features/models/residual-income"
import ComparablesAnalysis from "@/features/models/comparables"
import DividendDiscountAnalysis from "@/features/models/dividend-discount"
import TechnicalAnalysis from "@/features/models/technical"
import AdvancedAnalytics from "@/features/models/advanced-analytics"
import WACCWizard from "@/features/models/wacc"
import PrecedentTransactions from "@/features/models/precedent-transactions"
import InvestmentRecommendation from "@/components/investment-recommendation"
import DataTemplateManager from "@/components/data-template-manager"
import APIDataFetcher from "@/components/api-data-fetcher"
import Watchlist from "@/components/watchlist"
import ScenarioAnalysis from "@/features/models/scenario"
import EnhancedValuationSummary from "@/components/enhanced-valuation-summary"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Calculator,
  Brain,
  TrendingUp,
  BarChart3,
  LineChart,
  Award,
  Activity,
  Building2,
} from "lucide-react"

import type { StockData } from "@/types"
import { fetchStockData as fetchStockDataService } from "@/services/marketData/adapter"
import { useAssumptions } from "@/hooks/useAssumptions"
import { useValuation } from "@/hooks/useValuation"

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader"
import { StockInfoCard } from "@/features/dashboard/components/StockInfoCard"
import { AssumptionsPanel } from "@/features/dashboard/components/AssumptionsPanel"
import { WelcomeCard } from "@/features/dashboard/components/WelcomeCard"

import { ErrorBoundary } from "@/components/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  )
}

function Dashboard() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { assumptions, handleAssumptionChange, updateAssumptions } = useAssumptions()
  const { valuationResult, updateValuationResult, resetValuation } = useValuation()

  // Local state for non-valuation result data
  const [qualitativeRiskAdjustment] = useState(0)
  const [, setScenarioResults] = useState<object[]>([])
  const [templates, setTemplates] = useState<{ [key: string]: unknown }>({})

  const fetchStockData = useCallback(async (symbol: string) => {
    setIsLoading(true)
    try {
      const data = await fetchStockDataService(symbol)
      setStockData(data)
    } catch (error) {
      console.error("Failed to fetch stock data", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch initial data for a default stock
    fetchStockData("AAPL")
  }, [fetchStockData])

  const handleWACCCalculated = useCallback(
    (calculatedWacc: number, breakdown: { costOfEquity: number; costOfDebt: number; taxRate: number } | null) => {
      updateValuationResult("wacc", calculatedWacc) // Update WACC in valuation results
      
      // Update assumptions if breakdown is available
      if (breakdown) {
        updateAssumptions({
          discountRate: calculatedWacc,
          costOfEquity: breakdown.costOfEquity,
          costOfDebt: breakdown.costOfDebt,
          taxRate: breakdown.taxRate,
        })
      } else {
        updateAssumptions({ discountRate: calculatedWacc })
      }
    },
    [updateValuationResult, updateAssumptions],
  )

  const handleDCFCalculated = useCallback((val: number) => updateValuationResult("dcf", val), [updateValuationResult])
  const handleResidualIncomeCalculated = useCallback(
    (val: number) => updateValuationResult("residualIncome", val),
    [updateValuationResult],
  )
  const handleComparablesCalculated = useCallback(
    (val: number) => updateValuationResult("comparables", val),
    [updateValuationResult],
  )
  const handleDividendDiscountCalculated = useCallback(
    (val: number) => updateValuationResult("dividendDiscount", val),
    [updateValuationResult],
  )
  const handlePrecedentTransactionsCalculated = useCallback(
    (val: number) => updateValuationResult("precedentTransactions", val),
    [updateValuationResult],
  )

  const handleAPIDataFetched = useCallback((data: StockData) => {
    setStockData(data)
    resetValuation()
  }, [resetValuation])

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
        <DashboardHeader />

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="space-y-6">
            <StockSearch onSearch={fetchStockData} isLoading={isLoading} />
            <APIDataFetcher onDataFetched={handleAPIDataFetched} isLoading={isLoading} />
            <Watchlist currentStock={stockData} onSelect={fetchStockData} />
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
            <StockInfoCard stockData={stockData} />

            <AssumptionsPanel assumptions={assumptions} onAssumptionChange={handleAssumptionChange} />

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

              <TabsContent value="dcf" forceMount>
                <DCFAnalysis 
                  stockData={stockData} 
                  wacc={valuationResult.wacc} 
                  assumptions={assumptions} 
                  onDCFCalculated={handleDCFCalculated} 
                />
              </TabsContent>
              <TabsContent value="residual-income" forceMount>
                <ResidualIncomeAnalysis
                  stockData={stockData}
                  wacc={valuationResult.wacc}
                  assumptions={assumptions}
                  onResidualIncomeCalculated={handleResidualIncomeCalculated}
                />
              </TabsContent>
              <TabsContent value="comparables" forceMount>
                <ComparablesAnalysis 
                  stockData={stockData} 
                  onComparablesCalculated={handleComparablesCalculated} 
                />
              </TabsContent>
              <TabsContent value="dividend-discount" forceMount>
                <DividendDiscountAnalysis
                  stockData={stockData}
                  wacc={valuationResult.wacc}
                  assumptions={assumptions}
                  onDividendDiscountCalculated={handleDividendDiscountCalculated}
                />
              </TabsContent>
              <TabsContent value="precedent-transactions" forceMount>
                <PrecedentTransactions
                  stockData={stockData}
                  onPrecedentTransactionsCalculated={handlePrecedentTransactionsCalculated}
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
                  stockData={stockData}
                  onScenarioCalculated={setScenarioResults}
                />
              </TabsContent>
              <TabsContent value="advanced-analytics">
                <AdvancedAnalytics stockData={stockData} assumptions={assumptions} />
              </TabsContent>
            </Tabs>
          </>
        )}

        {!stockData && <WelcomeCard />}
      </div>
    </div>
  )
}
