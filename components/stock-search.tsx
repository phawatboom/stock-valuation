"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StockSearchProps {
  onSearch: (symbol: string) => void
  isLoading: boolean
}

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

export default function StockSearch({ onSearch, isLoading }: StockSearchProps) {
  const [symbol, setSymbol] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (symbol.trim().length >= 2) {
        setIsSearching(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(symbol)}`)
          const data = await res.json()
          setResults(data.results || [])
          setShowResults(true)
        } catch (error) {
          console.error("Search failed", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [symbol])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase())
      setShowResults(false)
    }
  }

  const handleSelect = (s: string) => {
    setSymbol(s)
    onSearch(s)
    setShowResults(false)
  }

  return (
    <Card className="w-full max-w-md overflow-visible relative">
      <CardHeader>
        <CardTitle>Search Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" ref={wrapperRef}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter symbol or company (e.g., Apple)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full"
                disabled={isLoading}
                onFocus={() => symbol.length >= 2 && setShowResults(true)}
              />
              {isSearching && (
                <div className="absolute right-2 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>

          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg p-1">
              {results.map((result) => (
                <button
                  key={`${result.symbol}-${result.exchange}`}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-sm flex flex-col"
                  onClick={() => handleSelect(result.symbol)}
                >
                  <span className="font-semibold">{result.symbol}</span>
                  <span className="text-xs text-gray-500 truncate">
                    {result.name} ({result.exchange})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
