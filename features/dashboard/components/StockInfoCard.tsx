import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { safeNumber, safeToFixed } from "@/lib/utils"
import type { StockData } from "@/types"

interface StockInfoCardProps {
  stockData: StockData
}

export function StockInfoCard({ stockData }: StockInfoCardProps) {
  return (
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
              {safeToFixed(stockData.financials.returnOnEquity * 100, 1)}%
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
  )
}
