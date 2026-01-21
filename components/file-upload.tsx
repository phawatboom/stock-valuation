"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { StockData } from "@/types"
import { normalizeStockData } from "@/services/marketData/adapter"
import { formatCurrency } from "@/lib/utils"

interface FileUploadProps {
  onFileUpload: (data: StockData) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [parsedData, setParsedData] = useState<StockData | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
      setMessage("")
    } else {
      setFile(null)
      setMessage("Please select a file.")
    }
  }

  const handleUpload = useCallback(() => {
    const fileToUpload = file
    if (!fileToUpload) {
      setMessage("No file selected for upload.")
      return
    }

    setFileName(fileToUpload.name)
    setUploadStatus("uploading")
    setUploadProgress(0)

    // Simulate file parsing progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Assuming JSON content for simplicity
        const rawData = JSON.parse(content)
        const parsedData = normalizeStockData(rawData)
        setUploadProgress(100)
        setParsedData(parsedData)
        setUploadStatus("success")
        setMessage(`File "${fileToUpload.name}" uploaded and processed successfully!`)
        onFileUpload(parsedData) // Trigger the file upload callback
        setFile(null) // Clear selected file after upload
      } catch (error) {
        setUploadStatus("error")
        setMessage("Error parsing file. Please ensure it's valid JSON.")
        console.error("File parsing error:", error)
      }
    }
    reader.readAsText(fileToUpload)

    clearInterval(progressInterval)
  }, [file, onFileUpload])

  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setFileName("")
    setParsedData(null)
    setFile(null)
    setMessage("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Financial Data
        </CardTitle>
        <CardDescription>Upload JSON files for custom analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="data-file">Financial Data File</Label>
          <Input id="data-file" type="file" onChange={handleFileChange} accept=".json" />
        </div>
        <Button onClick={handleUpload} disabled={!file} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          Upload Data
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        {uploadStatus === "idle" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your financial data file here, or click to browse
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Supported formats: JSON</p>
            </div>
          </div>
        )}

        {uploadStatus === "uploading" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-gray-600">Parsing financial data...</p>
              </div>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <div className="text-sm text-gray-600">
              {uploadProgress < 30 && "Reading file content..."}
              {uploadProgress >= 30 && uploadProgress < 60 && "Parsing JSON data..."}
              {uploadProgress >= 60 && uploadProgress < 90 && "Validating data integrity..."}
              {uploadProgress >= 90 && "Finalizing import..."}
            </div>
          </div>
        )}

        {uploadStatus === "success" && parsedData && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  {fileName}
                  <Badge variant="default">Imported</Badge>
                </p>
                <p className="text-sm text-gray-600">
                  {parsedData.companyName} ({parsedData.symbol})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Data Points Imported:</p>
                <ul className="text-gray-600 mt-1">
                  <li>• Financial statements</li>
                  <li>• Key financial ratios</li>
                  <li>• Valuation multiples</li>
                  <li>• Market data</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Latest Metrics:</p>
                <ul className="text-gray-600 mt-1">
                  <li>
                    • Revenue: {formatCurrency(parsedData.financials?.revenue / 1000000000, parsedData.currency, 0)}B
                  </li>
                  <li>
                    • Net Income: {formatCurrency(parsedData.financials?.netIncome / 1000000000, parsedData.currency, 0)}B
                  </li>
                  <li>• ROE: {(parsedData.financials?.returnOnEquity).toFixed(1)}%</li>
                  <li>• P/E: {parsedData.metrics?.priceToEarnings.toFixed(1)}x</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={resetUpload} variant="outline">
                Upload Another File
              </Button>
              <Button size="sm" variant="outline">
                View Raw Data
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-600">Upload Failed</p>
                <p className="text-sm text-gray-600">Unable to parse the uploaded file. Please check the format.</p>
              </div>
            </div>
            <Button size="sm" onClick={resetUpload} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
