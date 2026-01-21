// Core data types for the valuation application

export interface FinancialData {
  revenue: number
  netIncome: number
  totalDebt: number
  cashAndEquivalents: number
  totalAssets: number
  totalEquity: number
  ebitda: number
  operatingCashFlow: number
  freeCashFlow: number
  fcfMargin: number
  grossMargin: number
  operatingMargin: number
  netMargin: number
  returnOnEquity: number
  returnOnAssets: number
  debtToEquity: number
  currentRatio: number
  quickRatio: number
  interestExpense: number
  dividendsPerShare: number
}

export interface StockMetrics {
  currentPrice: number
  sharesOutstanding: number
  marketCap: number
  priceToEarnings: number
  priceToBook: number
  enterpriseValue: number
  evToRevenue: number
  evToEbitda: number
  dividendYield: number
  beta: number
  yearHigh: number
  yearLow: number
}

export interface Assumptions {
  revenueGrowthRate: number
  terminalGrowthRate: number
  discountRate: number
  taxRate: number
  costOfEquity: number
  costOfDebt: number
  marketRiskPremium: number
  riskFreeRate: number
  dividendGrowthRate: number
  marginImprovement: number
  betaAdjustment: number
}

export interface TechnicalIndicators {
  rsi: number
  macd: number
  sma20: number
  sma50: number
  sma200: number
  bollingerUpper: number
  bollingerLower: number
  volume: number
  avgVolume: number
  beta: number
  correlation: number
  movingAverage50?: number
  movingAverage200?: number
  volatility?: number
  supportLevel?: number
  resistanceLevel?: number
}

export interface PriceDataPoint {
  date: string
  close: number
  volume: number
}

export interface StockData {
  symbol: string
  companyName: string
  sector: string
  industry: string
  financials: FinancialData
  metrics: StockMetrics
  assumptions: Assumptions
  lastUpdated: string
  technicalIndicators?: TechnicalIndicators
  priceData?: PriceDataPoint[]
  isMock?: boolean
  currency?: string
}

export interface ValuationResult {
  method: string
  value: number
  confidence: number
  details?: Record<string, any>
}

export interface ValuationSummary {
  currentPrice: number
  targetPrice: number
  upside: number
  recommendation: 'BUY' | 'HOLD' | 'SELL'
  confidenceScore: number
  results: ValuationResult[]
}

export interface DCFProjection {
  year: string
  revenue: number
  fcf: number
  presentValue: number
  terminalValue?: number
}

export interface ComparableCompany {
  symbol: string
  name: string
  sector: string
  peRatio: number
  pbRatio: number
  evRevenue: number
  evEbitda: number
}

export interface PrecedentTransaction {
  targetCompany: string
  acquirer: string
  transactionValue: number
  evRevenue: number
  evEbitda: number
  peRatio: number
  date: string
}

export interface WACCComponents {
  equityWeight: number
  debtWeight: number
  costOfEquity: number
  costOfDebt: number
  taxRate: number
  wacc: number
}

export interface HealthScore {
  overall: number
  breakdown: {
    profitability: number
    liquidity: number
    leverage: number
    efficiency: number
    growth: number
  }
}

export interface ScenarioAnalysis {
  base: number
  optimistic: number
  pessimistic: number
  probability: {
    optimistic: number
    base: number
    pessimistic: number
  }
}

// Component prop interfaces
export interface BaseValuationProps {
  stockData?: StockData
  onCalculated: (value: number) => void
}

export interface DCFAnalysisProps extends BaseValuationProps {
  wacc?: number
  onDCFCalculated: (value: number) => void
}

export interface ComparablesAnalysisProps extends BaseValuationProps {
  onComparablesCalculated: (value: number) => void
}

export interface PrecedentTransactionsProps extends BaseValuationProps {
  onPrecedentTransactionsCalculated: (value: number) => void
}

export interface DividendDiscountProps extends BaseValuationProps {
  onDividendDiscountCalculated: (value: number) => void
}

export interface ResidualIncomeProps extends BaseValuationProps {
  onResidualIncomeCalculated: (value: number) => void
}

export interface WACCWizardProps {
  stockData?: StockData
  onWACCCalculated: (wacc: number, components: WACCComponents) => void
}

export interface TechnicalAnalysisProps {
  stockData?: StockData
}

export interface AdvancedAnalyticsProps {
  stockData?: StockData
  valuationResults?: ValuationResult[]
}

export interface InvestmentRecommendationProps {
  stockData?: StockData
  valuationSummary?: ValuationSummary
}

export interface QualitativeAssessmentProps {
  stockData?: StockData
  onAssessmentComplete: (score: number) => void
}

export interface ScenarioAnalysisProps {
  stockData?: StockData
  valuationResults?: ValuationResult[]
  onScenarioComplete: (analysis: ScenarioAnalysis) => void
}

// Error types
export interface ValidationError {
  field: string
  message: string
}

export interface CalculationError {
  component: string
  message: string
  details?: any
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface StockSearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}