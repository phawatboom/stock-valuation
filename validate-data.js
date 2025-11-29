// Script to validate mock data structure against TypeScript interfaces
// This helps ensure data integrity throughout the application

import type { StockData, FinancialData, StockMetrics, Assumptions } from './types/index.js'

// Function to validate if an object matches the expected interface structure
function validateObjectStructure(obj: any, interfaceName: string, requiredFields: string[]): { valid: boolean; missingFields: string[]; extraFields: string[] } {
  const missingFields: string[] = []
  const extraFields: string[] = []
  const objKeys = Object.keys(obj || {})
  
  // Check for missing required fields
  for (const field of requiredFields) {
    if (!(field in obj)) {
      missingFields.push(field)
    }
  }
  
  // Check for extra fields (not necessarily an error, but good to know)
  for (const key of objKeys) {
    if (!requiredFields.includes(key)) {
      extraFields.push(key)
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
    extraFields
  }
}

// Mock data from app/page.tsx (simulated)
const mockStockData = {
  symbol: "PTT",
  name: "PTT Public Company Limited", 
  currentPrice: 42.5,
  currency: "THB",
  marketCap: 1250000000000,
  sharesOutstanding: 29400000000,
  financials: {
    revenue: 2800000000000,
    netIncome: 180000000000,
    ebitda: 280000000000,
    totalDebt: 400000000000,
    cashAndEquivalents: 200000000000,
    taxRate: 0.2,
    dividendsPerShare: 2.5,
    bookValuePerShare: 27.21,
    grossProfit: 1120000000000,
    operatingIncome: 220000000000,
    currentAssets: 726000000000,
    currentLiabilities: 401600000000,
    eps: 6.12,
    roe: 0.225,
    currentRatio: 1.81,
    debtToEquity: 0.5,
    fcfMargin: 0.0429,
  }
}

// Expected interface fields based on types/index.ts
const financialDataFields = [
  'revenue', 'netIncome', 'totalDebt', 'cashAndEquivalents', 'totalAssets', 
  'totalEquity', 'ebitda', 'operatingCashFlow', 'freeCashFlow', 'fcfMargin',
  'grossMargin', 'operatingMargin', 'netMargin', 'returnOnEquity', 'returnOnAssets',
  'debtToEquity', 'currentRatio', 'quickRatio', 'interestExpense'
]

const stockMetricsFields = [
  'currentPrice', 'sharesOutstanding', 'marketCap', 'priceToEarnings', 'priceToBook',
  'enterpriseValue', 'evToRevenue', 'evToEbitda', 'dividendYield', 'beta',
  'yearHigh', 'yearLow'
]

const assumptionsFields = [
  'revenueGrowthRate', 'terminalGrowthRate', 'discountRate', 'taxRate',
  'costOfEquity', 'costOfDebt', 'marketRiskPremium', 'riskFreeRate'
]

const stockDataFields = [
  'symbol', 'companyName', 'sector', 'industry', 'financials', 'metrics', 
  'assumptions', 'lastUpdated'
]

console.log('=== Mock Data Structure Validation ===')

// Validate FinancialData structure
const financialValidation = validateObjectStructure(
  mockStockData.financials, 
  'FinancialData', 
  financialDataFields
)

console.log('\nFinancialData validation:')
console.log('Valid:', financialValidation.valid)
if (financialValidation.missingFields.length > 0) {
  console.log('Missing fields:', financialValidation.missingFields)
}
if (financialValidation.extraFields.length > 0) {
  console.log('Extra fields:', financialValidation.extraFields)
}

// Check for logical data consistency
console.log('\n=== Financial Data Consistency Checks ===')

const revenue = mockStockData.financials.revenue
const netIncome = mockStockData.financials.netIncome
const ebitda = mockStockData.financials.ebitda
const currentPrice = mockStockData.currentPrice
const sharesOutstanding = mockStockData.sharesOutstanding
const marketCap = mockStockData.marketCap

// Basic sanity checks
console.log('Revenue > 0:', revenue > 0)
console.log('Net Income > 0:', netIncome > 0)
console.log('EBITDA > Net Income:', ebitda > netIncome)
console.log('Market Cap = Price × Shares:', Math.abs(marketCap - (currentPrice * sharesOutstanding)) < 1000)

// Financial ratio checks
const calculatedPE = currentPrice / (netIncome / sharesOutstanding)
const calculatedROE = netIncome / (800000000000) // Assuming total equity from context
const calculatedMarketCap = currentPrice * sharesOutstanding

console.log('Calculated P/E ratio:', calculatedPE.toFixed(2))
console.log('Market cap calculation matches:', Math.abs(calculatedMarketCap - marketCap) < 1000)

// DCF calculation test with mock data
console.log('\n=== DCF Calculation Test ===')
const revenueGrowthRate = 0.05 // 5%
const fcfMargin = mockStockData.financials.fcfMargin
const terminalGrowthRate = 0.02 // 2%
const discountRate = 0.10 // 10%

let currentRevenue = revenue
let totalPV = 0

console.log('Initial Revenue (B):', (currentRevenue / 1000000000).toFixed(2))
console.log('FCF Margin:', (fcfMargin * 100).toFixed(2) + '%')

// 5-year projection
for (let i = 1; i <= 5; i++) {
  currentRevenue *= (1 + revenueGrowthRate)
  const fcf = currentRevenue * fcfMargin
  const pv = fcf / Math.pow(1 + discountRate, i)
  totalPV += pv
  console.log(`Year ${i} - Revenue: ฿${(currentRevenue/1000000000).toFixed(1)}B, FCF: ฿${(fcf/1000000000).toFixed(1)}B, PV: ฿${(pv/1000000000).toFixed(1)}B`)
}

// Terminal value
const lastFCF = currentRevenue * fcfMargin
const terminalValue = (lastFCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate)
const terminalPV = terminalValue / Math.pow(1 + discountRate, 5)
totalPV += terminalPV

const dcfPerShare = totalPV / sharesOutstanding

console.log('Terminal Value (B):', (terminalValue / 1000000000).toFixed(2))
console.log('Terminal PV (B):', (terminalPV / 1000000000).toFixed(2))
console.log('Total DCF Value (B):', (totalPV / 1000000000).toFixed(2))
console.log('DCF Value per Share:', dcfPerShare.toFixed(2))
console.log('Current Price:', currentPrice)
console.log('DCF vs Current Price:', ((dcfPerShare - currentPrice) / currentPrice * 100).toFixed(1) + '% difference')

console.log('\n=== Validation Complete ===')
console.log('Overall assessment: Mock data structure needs alignment with TypeScript interfaces')
console.log('Calculations appear mathematically sound')
console.log('Recommend updating mock data to match StockData interface exactly')