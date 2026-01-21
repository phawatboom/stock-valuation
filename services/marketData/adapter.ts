import { StockData, FinancialData, StockMetrics, Assumptions, TechnicalIndicators } from "@/types"
import { mockStockData } from "./mock"

export function normalizeStockData(data: any): StockData {
  // Helper to ensure number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const num = (val: any, defaultVal = 0) => {
    const n = parseFloat(val)
    return isNaN(n) ? defaultVal : n
  }

  // Helper to ensure string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const str = (val: any, defaultVal = "") => (val ? String(val) : defaultVal)

  const financials: FinancialData = {
    revenue: num(data?.financials?.revenue),
    netIncome: num(data?.financials?.netIncome),
    totalDebt: num(data?.financials?.totalDebt),
    cashAndEquivalents: num(data?.financials?.cashAndEquivalents),
    totalAssets: num(data?.financials?.totalAssets),
    totalEquity: num(data?.financials?.totalEquity),
    ebitda: num(data?.financials?.ebitda),
    operatingCashFlow: num(data?.financials?.operatingCashFlow),
    freeCashFlow: num(data?.financials?.freeCashFlow),
    fcfMargin: num(data?.financials?.fcfMargin),
    grossMargin: num(data?.financials?.grossMargin),
    operatingMargin: num(data?.financials?.operatingMargin),
    netMargin: num(data?.financials?.netMargin),
    returnOnEquity: num(data?.financials?.returnOnEquity),
    returnOnAssets: num(data?.financials?.returnOnAssets),
    debtToEquity: num(data?.financials?.debtToEquity),
    currentRatio: num(data?.financials?.currentRatio),
    quickRatio: num(data?.financials?.quickRatio),
    interestExpense: num(data?.financials?.interestExpense),
    dividendsPerShare: num(data?.financials?.dividendsPerShare),
  }

  const metrics: StockMetrics = {
    currentPrice: num(data?.metrics?.currentPrice),
    sharesOutstanding: num(data?.metrics?.sharesOutstanding),
    marketCap: num(data?.metrics?.marketCap),
    priceToEarnings: num(data?.metrics?.priceToEarnings),
    priceToBook: num(data?.metrics?.priceToBook),
    enterpriseValue: num(data?.metrics?.enterpriseValue),
    evToRevenue: num(data?.metrics?.evToRevenue),
    evToEbitda: num(data?.metrics?.evToEbitda),
    dividendYield: num(data?.metrics?.dividendYield),
    beta: num(data?.metrics?.beta, 1),
    yearHigh: num(data?.metrics?.yearHigh),
    yearLow: num(data?.metrics?.yearLow),
  }

  const assumptions: Assumptions = {
    revenueGrowthRate: num(data?.assumptions?.revenueGrowthRate, 5),
    terminalGrowthRate: num(data?.assumptions?.terminalGrowthRate, 3),
    discountRate: num(data?.assumptions?.discountRate, 10),
    taxRate: num(data?.assumptions?.taxRate, 20),
    costOfEquity: num(data?.assumptions?.costOfEquity, 12),
    costOfDebt: num(data?.assumptions?.costOfDebt, 5),
    marketRiskPremium: num(data?.assumptions?.marketRiskPremium, 6),
    riskFreeRate: num(data?.assumptions?.riskFreeRate, 3.5),
    dividendGrowthRate: num(data?.assumptions?.dividendGrowthRate, 3),
    marginImprovement: num(data?.assumptions?.marginImprovement, 0),
    betaAdjustment: num(data?.assumptions?.betaAdjustment, 0),
  }

  const technicalIndicators: TechnicalIndicators = {
    rsi: num(data?.technicalIndicators?.rsi),
    macd: num(data?.technicalIndicators?.macd),
    sma20: num(data?.technicalIndicators?.sma20),
    sma50: num(data?.technicalIndicators?.sma50),
    sma200: num(data?.technicalIndicators?.sma200),
    bollingerUpper: num(data?.technicalIndicators?.bollingerUpper),
    bollingerLower: num(data?.technicalIndicators?.bollingerLower),
    volume: num(data?.technicalIndicators?.volume),
    avgVolume: num(data?.technicalIndicators?.avgVolume),
    beta: num(data?.technicalIndicators?.beta, 1),
    correlation: num(data?.technicalIndicators?.correlation),
    movingAverage50: num(data?.technicalIndicators?.movingAverage50),
    movingAverage200: num(data?.technicalIndicators?.movingAverage200),
    volatility: num(data?.technicalIndicators?.volatility),
    supportLevel: num(data?.technicalIndicators?.supportLevel),
    resistanceLevel: num(data?.technicalIndicators?.resistanceLevel),
  }

  return {
    symbol: str(data?.symbol, "UNKNOWN"),
    companyName: str(data?.companyName, "Unknown Company"),
    sector: str(data?.sector, "Unknown Sector"),
    industry: str(data?.industry, "Unknown Industry"),
    financials,
    metrics,
    assumptions,
    lastUpdated: str(data?.lastUpdated, new Date().toISOString()),
    technicalIndicators,
    priceData: Array.isArray(data?.priceData) ? data.priceData : [],
  }
}

export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    const response = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data as StockData;
    } catch (error) {
      console.warn(`Failed to fetch live data for ${symbol}, falling back to mock data.`, error);
      // Fallback to mock data if API fails
              return {
                ...mockStockData,
                symbol: symbol.toUpperCase(),
                companyName: `${symbol.toUpperCase()} (Mock Data - API Failed)`,
                isMock: true,
                currency: "USD",
              };
              }
  }
  