"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash2, Plus } from "lucide-react"
import type { StockData } from "@/types"

interface WatchlistProps {
  currentStock?: StockData | null
  onSelect: (symbol: string) => void
}

interface WatchlistItem {
  symbol: string
  name: string
}

export default function Watchlist({ currentStock, onSelect }: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("valuation-watchlist")
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse watchlist", e)
      }
    }
  }, [])

  const saveWatchlist = (items: WatchlistItem[]) => {
    setWatchlist(items)
    localStorage.setItem("valuation-watchlist", JSON.stringify(items))
  }

  const addToWatchlist = () => {
    if (!currentStock) return
    if (watchlist.some((item) => item.symbol === currentStock.symbol)) return

    const newItem = { symbol: currentStock.symbol, name: currentStock.companyName }
    saveWatchlist([...watchlist, newItem])
  }

  const removeFromWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    saveWatchlist(watchlist.filter((item) => item.symbol !== symbol))
  }

  const isInWatchlist = currentStock ? watchlist.some((item) => item.symbol === currentStock.symbol) : false

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-500" />
            Watchlist
          </CardTitle>
          {currentStock && !isInWatchlist && (
            <Button size="sm" variant="outline" onClick={addToWatchlist} title="Add current stock">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No stocks saved yet.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {watchlist.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer border group"
                onClick={() => onSelect(item.symbol)}
              >
                <div>
                  <div className="font-bold text-sm">{item.symbol}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">{item.name}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => removeFromWatchlist(item.symbol, e)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
