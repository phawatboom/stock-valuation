import YahooFinance from 'yahoo-finance2';
import { StockData, FinancialData, StockMetrics, Assumptions, TechnicalIndicators } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let YF: any = YahooFinance;
// Handle CommonJS/ESM interop where default might be nested
if (YF.default) {
  YF = YF.default;
}
const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });

// Helper to safely get number
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNum = (val: any, defaultVal = 0): number => {
  let parsed = val;
  if (parsed && typeof parsed === "object" && "raw" in parsed) {
    parsed = parsed.raw;
  }
  const num = parseFloat(parsed);
  return isNaN(num) || !isFinite(num) ? defaultVal : num;
};

// Helper to safely get string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStr = (val: any, defaultVal = ""): string => {
  return val ? String(val) : defaultVal;
};

export async function getStockData(symbol: string): Promise<StockData> {
  try {
    const queryOptions = {
      modules: [
        'price',
        'summaryDetail',
        'defaultKeyStatistics',
        'financialData',
        'incomeStatementHistory',
        'balanceSheetHistory',
        'cashflowStatementHistory',
        'earningsHistory',
      ]
    };
    
    // Yahoo Finance requires a slightly different type casting or suppression because the modules return type is complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultPromise: Promise<any> = yahooFinance.quoteSummary(symbol, queryOptions as any);

    // Fetch historical data (last 6 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const historyPromise: Promise<any> = yahooFinance.historical(symbol, {
      period1: startDate.toISOString().split('T')[0],
      period2: endDate.toISOString().split('T')[0],
      interval: '1d'
    });

    const [result, historyResult] = await Promise.allSettled([resultPromise, historyPromise]);

    if (result.status === 'rejected' || !result.value) {
      throw new Error(`No data found for symbol ${symbol}`);
    }

    const data = result.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const priceData = historyResult.status === 'fulfilled' ? historyResult.value.map((d: any) => ({
      date: d.date.toISOString().split('T')[0],
      close: d.close,
      volume: d.volume
    })) : [];

    const price = data.price || {};
    const summary = data.summaryDetail || {};
    const stats = data.defaultKeyStatistics || {};
    const financials = data.financialData || {};
    
    // Get latest available statements
    const incomeStatement = data.incomeStatementHistory?.incomeStatementHistory?.[0] || {};
    const balanceSheet = data.balanceSheetHistory?.balanceSheetStatements?.[0] || {};
    const cashflowStatement = data.cashflowStatementHistory?.cashflowStatements?.[0] || {};

    // Calculate CAGR for Revenue
    let calculatedRevenueGrowth = 5; // Default
    const history = data.incomeStatementHistory?.incomeStatementHistory || [];
    if (history.length >= 2) {
      const latestRevenue = getNum(history[0].totalRevenue);
      const oldestRevenue = getNum(history[history.length - 1].totalRevenue);
      const years = history.length - 1;
      
      if (latestRevenue > 0 && oldestRevenue > 0 && years > 0) {
        const cagr = (Math.pow(latestRevenue / oldestRevenue, 1 / years) - 1) * 100;
        // Cap reasonably for defaults
        calculatedRevenueGrowth = Math.max(-10, Math.min(30, cagr)); 
      }
    }

    // Financial Data Mapping
    const revenue = getNum(financials.totalRevenue || incomeStatement.totalRevenue);
    const netIncome = getNum(incomeStatement.netIncome);
    const ebitda = getNum(financials.ebitda);
    
    const totalDebt = getNum(financials.totalDebt);
    const cashAndEquivalents = getNum(financials.totalCash);
    const totalAssets = getNum(balanceSheet.totalAssets);
    const totalEquity = getNum(balanceSheet.totalStockholderEquity);
    
    const operatingCashFlow = getNum(cashflowStatement.totalCashFromOperatingActivities);
    const capitalExpenditures = getNum(cashflowStatement.capitalExpenditures);
    const freeCashFlow = getNum(financials.freeCashflow) || (operatingCashFlow + capitalExpenditures); // CapEx is usually negative

    // Ratios & Margins
    const grossMargin = getNum(financials.grossMargins);
    const operatingMargin = getNum(financials.operatingMargins);
    const netMargin = getNum(financials.profitMargins);
    const returnOnEquity = getNum(financials.returnOnEquity);
    const returnOnAssets = getNum(financials.returnOnAssets);
    const debtToEquity = getNum(financials.debtToEquity) / 100; // Yahoo gives percentage
    const currentRatio = getNum(financials.currentRatio);
    const quickRatio = getNum(financials.quickRatio);
    
    const interestExpense = Math.abs(getNum(incomeStatement.interestExpense)); // Usually negative
    const dividendsPerShare = getNum(summary.dividendRate);

    const mappedFinancials: FinancialData = {
      revenue,
      netIncome,
      totalDebt,
      cashAndEquivalents,
      totalAssets,
      totalEquity,
      ebitda,
      operatingCashFlow,
      freeCashFlow,
      fcfMargin: revenue ? freeCashFlow / revenue : 0,
      grossMargin,
      operatingMargin,
      netMargin,
      returnOnEquity,
      returnOnAssets,
      debtToEquity,
      currentRatio,
      quickRatio,
      interestExpense,
      dividendsPerShare,
    };

    // Metrics Mapping
    const currentPrice = getNum(price.regularMarketPrice);
    const sharesOutstanding = getNum(stats.sharesOutstanding);
    const marketCap = getNum(price.marketCap);
    const priceToEarnings = getNum(summary.trailingPE);
    const priceToBook = getNum(stats.priceToBook);
    const enterpriseValue = getNum(stats.enterpriseValue);
    const evToRevenue = getNum(stats.enterpriseToRevenue);
    const evToEbitda = getNum(stats.enterpriseToEbitda);
    const dividendYield = getNum(summary.dividendYield) * 100; // Convert to percentage
    const beta = getNum(summary.beta, 1);
    const yearHigh = getNum(summary.fiftyTwoWeekHigh);
    const yearLow = getNum(summary.fiftyTwoWeekLow);

    const mappedMetrics: StockMetrics = {
      currentPrice,
      sharesOutstanding,
      marketCap,
      priceToEarnings,
      priceToBook,
      enterpriseValue,
      evToRevenue,
      evToEbitda,
      dividendYield,
      beta,
      yearHigh,
      yearLow,
    };

    // Assumptions (Defaults, as API doesn't provide these directly)
    const mappedAssumptions: Assumptions = {
      revenueGrowthRate: Number(calculatedRevenueGrowth.toFixed(2)),
      terminalGrowthRate: 3,
      discountRate: Number((9 + (beta - 1) * 2).toFixed(2)), // Simple CAPM-like estimation
      taxRate: 21, // US default
      costOfEquity: 10,
      costOfDebt: 5,
      marketRiskPremium: 6,
      riskFreeRate: 4,
      dividendGrowthRate: 3,
      marginImprovement: 0,
      betaAdjustment: 0,
    };

    // Technical Indicators (Basic ones from summary)
    const mappedTechnicalIndicators: TechnicalIndicators = {
        rsi: 50, // Placeholder
        macd: 0, // Placeholder
        sma20: getNum(summary.fiftyDayAverage), // Approximation
        sma50: getNum(summary.fiftyDayAverage),
        sma200: getNum(summary.twoHundredDayAverage),
        bollingerUpper: 0,
        bollingerLower: 0,
        volume: getNum(summary.volume),
        avgVolume: getNum(summary.averageVolume),
        beta: beta,
        correlation: 1,
        movingAverage50: getNum(summary.fiftyDayAverage),
        movingAverage200: getNum(summary.twoHundredDayAverage),
    };

    return {
      symbol: symbol.toUpperCase(),
      companyName: getStr(price.longName, symbol),
      sector: getStr(summary.sector, "Unknown"),
      industry: getStr(summary.industry, "Unknown"),
      financials: mappedFinancials,
      metrics: mappedMetrics,
      assumptions: mappedAssumptions,
      lastUpdated: new Date().toISOString(),
      technicalIndicators: mappedTechnicalIndicators,
      priceData: priceData,
      isMock: false,
      currency: getStr(price.currency, "USD"),
    };

  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
}
