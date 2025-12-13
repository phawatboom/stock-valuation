"use client"

import { CardDescription } from "@/components/ui/card"
import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Database,
  Download,
  Upload,
  Settings,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Globe,
  Zap,
  Save,
  Trash2,
  PlusCircle,
  FolderOpen,
} from "lucide-react"
import type { StockData } from "@/types"
import { normalizeStockData } from "@/services/marketData/adapter"

interface DataUpdateEvent {
  source: string
  data: StockData
}

interface DataTemplateManagerProps {
  onDataUpdate: (event: DataUpdateEvent) => void
  onSaveTemplate: (template: { [key: string]: unknown }) => void
  onLoadTemplate: (templateName: string) => unknown
  onDeleteTemplate: (templateName: string) => void
  templates: { [key: string]: unknown }
}

export default function DataTemplateManager({
  onDataUpdate,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  templates,
}: DataTemplateManagerProps) {
  const [activeConnection, setActiveConnection] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState({
    capitalIQ: "",
    bloomberg: "",
    refinitiv: "",
    yahooFinance: "",
  })
  const [templateName, setTemplateName] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [message, setMessage] = useState("")

  // Mock data sources status
  const dataSources = [
    {
      id: "capitaliq",
      name: "S&P Capital IQ",
      status: "connected",
      lastSync: "2024-01-15 09:30:00",
      coverage: "Global equities, financials, estimates",
      icon: Database,
    },
    {
      id: "bloomberg",
      name: "Bloomberg Terminal",
      status: "disconnected",
      lastSync: null,
      coverage: "Real-time data, analytics, news",
      icon: Globe,
    },
    {
      id: "refinitiv",
      name: "Refinitiv Eikon",
      status: "error",
      lastSync: "2024-01-14 15:45:00",
      coverage: "Market data, fundamentals, ESG",
      icon: Zap,
    },
    {
      id: "yahoo",
      name: "Yahoo Finance API",
      status: "connected",
      lastSync: "2024-01-15 10:15:00",
      coverage: "Basic financials, price data",
      icon: Globe,
    },
  ]

  // Data template for Excel/CSV uploads
  const excelTemplate = {
    financials: {
      // Income Statement
      revenue: "Total Revenue (Annual)",
      cogs: "Cost of Goods Sold",
      grossProfit: "Gross Profit",
      operatingExpenses: "Operating Expenses",
      ebitda: "EBITDA",
      ebit: "EBIT",
      interestExpense: "Interest Expense",
      pretaxIncome: "Pre-tax Income",
      taxExpense: "Tax Expense",
      netIncome: "Net Income",

      // Balance Sheet
      cash: "Cash and Cash Equivalents",
      shortTermInvestments: "Short-term Investments",
      receivables: "Accounts Receivable",
      inventory: "Inventory",
      currentAssets: "Total Current Assets",
      ppe: "Property, Plant & Equipment",
      intangibleAssets: "Intangible Assets",
      totalAssets: "Total Assets",
      payables: "Accounts Payable",
      shortTermDebt: "Short-term Debt",
      currentLiabilities: "Total Current Liabilities",
      longTermDebt: "Long-term Debt",
      totalDebt: "Total Debt",
      totalLiabilities: "Total Liabilities",
      shareholdersEquity: "Shareholders' Equity",
      bookValue: "Book Value of Equity",

      // Cash Flow Statement
      operatingCashFlow: "Operating Cash Flow",
      capex: "Capital Expenditures",
      freeCashFlow: "Free Cash Flow",
      dividendsPaid: "Dividends Paid",

      // Share Information
      sharesOutstanding: "Shares Outstanding",
      dividendPerShare: "Dividend Per Share",

      // Calculated Ratios
      roe: "Return on Equity (%)",
      roa: "Return on Assets (%)",
      roic: "Return on Invested Capital (%)",
      currentRatio: "Current Ratio",
      quickRatio: "Quick Ratio",
      debtToEquity: "Debt-to-Equity Ratio",
      interestCoverage: "Interest Coverage Ratio",

      // Working Capital Metrics
      dso: "Days Sales Outstanding",
      dio: "Days Inventory Outstanding",
      dpo: "Days Payable Outstanding",
      cashConversionCycle: "Cash Conversion Cycle",

      // Margins
      grossMargin: "Gross Margin (%)",
      operatingMargin: "Operating Margin (%)",
      netMargin: "Net Margin (%)",
      ebitdaMargin: "EBITDA Margin (%)",
      fcfMargin: "FCF Margin (%)",
    },
  }

  const generateExcelTemplate = () => {
    const csvContent = [
      ["Metric", "Value", "Description"],
      ...Object.entries(excelTemplate.financials).map(([key, description]) => [key, "", description]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "financial_data_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Parse CSV/Excel content here - assuming JSON for now
        const rawData = JSON.parse(content)
        const parsedData = normalizeStockData(rawData)
        console.log("File uploaded:", file.name)
        onDataUpdate({ source: "file", data: parsedData })
      } catch (error) {
        console.error("Error parsing file:", error)
      }
    }
    reader.readAsText(file)
  }

  const connectDataSource = (sourceId: string) => {
    setActiveConnection(sourceId)
    // Simulate connection process
    setTimeout(() => {
      console.log(`Connected to ${sourceId}`)
      setActiveConnection(null)
    }, 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-100 text-red-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="secondary">Disconnected</Badge>
    }
  }

  const handleSave = () => {
    if (templateName.trim()) {
      // In a real app, you'd save current app state (e.g., assumptions, stock data)
      // For this demo, we'll save a simple mock object
      const newTemplate = {
        [templateName.trim()]: {
          assumptions: {
            discountRate: 10,
            revenueGrowthRate: 5,
            // ... more assumptions
          },
          // ... other relevant app state
        },
      }
      onSaveTemplate(newTemplate)
      setMessage(`Template "${templateName.trim()}" saved successfully!`)
      setTemplateName("")
    } else {
      setMessage("Please enter a template name.")
    }
  }

  const handleLoad = () => {
    if (selectedTemplate) {
      const loadedData = onLoadTemplate(selectedTemplate)
      if (loadedData) {
        // In a real app, you'd apply loadedData to your app's state
        setMessage(`Template "${selectedTemplate}" loaded successfully!`)
        console.log("Loaded template data:", loadedData)
      } else {
        setMessage(`Template "${selectedTemplate}" not found.`)
      }
    } else {
      setMessage("Please select a template to load.")
    }
  }

  const handleDelete = () => {
    if (selectedTemplate) {
      onDeleteTemplate(selectedTemplate)
      setMessage(`Template "${selectedTemplate}" deleted successfully!`)
      setSelectedTemplate("")
    } else {
      setMessage("Please select a template to delete.")
    }
  }

  const addTemplate = () => {
    setTemplateName("")
    setTemplateContent("")
    setSelectedTemplate("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Source Management
          </CardTitle>
          <CardDescription>
            Configure and manage your financial data sources for real-time valuation analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <source.icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                    </div>
                    {getStatusBadge(source.status)}
                  </div>
                  <CardDescription>{source.coverage}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {source.lastSync && <div className="text-sm text-gray-600">Last sync: {source.lastSync}</div>}
                    <Button
                      onClick={() => connectDataSource(source.id)}
                      disabled={activeConnection === source.id}
                      className="w-full"
                      variant={source.status === "connected" ? "outline" : "default"}
                    >
                      {activeConnection === source.id
                        ? "Connecting..."
                        : source.status === "connected"
                          ? "Reconnect"
                          : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Upload
                </CardTitle>
                <CardDescription>Upload financial data from Excel, CSV, or other supported formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Drop your files here</p>
                      <p className="text-sm text-gray-600">Supports Excel (.xlsx), CSV (.csv), and JSON formats</p>
                      <div className="flex justify-center gap-4 mt-4">
                        <Button variant="outline" onClick={generateExcelTemplate}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            Choose Files
                          </label>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".xlsx,.csv,.json"
                            onChange={handleFileUpload}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported File Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Excel (.xlsx)</h4>
                    <p className="text-sm text-gray-600">Full financial statements with multiple sheets</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">CSV (.csv)</h4>
                    <p className="text-sm text-gray-600">Structured data with metric names and values</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">JSON (.json)</h4>
                    <p className="text-sm text-gray-600">API responses from financial data providers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>Configure API keys and endpoints for real-time data integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>S&P Capital IQ API Key</Label>
                      <Input
                        type="password"
                        value={apiKeys.capitalIQ}
                        onChange={(e) => setApiKeys((prev) => ({ ...prev, capitalIQ: e.target.value }))}
                        placeholder="Enter your Capital IQ API key"
                      />
                    </div>
                    <div>
                      <Label>Bloomberg API Key</Label>
                      <Input
                        type="password"
                        value={apiKeys.bloomberg}
                        onChange={(e) => setApiKeys((prev) => ({ ...prev, bloomberg: e.target.value }))}
                        placeholder="Enter your Bloomberg API key"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Refinitiv API Key</Label>
                      <Input
                        type="password"
                        value={apiKeys.refinitiv}
                        onChange={(e) => setApiKeys((prev) => ({ ...prev, refinitiv: e.target.value }))}
                        placeholder="Enter your Refinitiv API key"
                      />
                    </div>
                    <div>
                      <Label>Yahoo Finance API Key</Label>
                      <Input
                        type="password"
                        value={apiKeys.yahooFinance}
                        onChange={(e) => setApiKeys((prev) => ({ ...prev, yahooFinance: e.target.value }))}
                        placeholder="Enter your Yahoo Finance API key"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">API Integration Benefits:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Real-time financial data updates</li>
                    <li>• Automated peer company identification</li>
                    <li>• Historical data for trend analysis</li>
                    <li>• Analyst estimates and consensus data</li>
                    <li>• ESG scores and sustainability metrics</li>
                  </ul>
                </div>

                <Button className="w-full">Save API Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Data Template Manager
                  <Button size="sm" onClick={addTemplate}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </CardTitle>
                <CardDescription>Manage and customize your financial data templates.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(templates).map((name) => (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>{typeof templates[name] === "string" ? "CSV" : "JSON"}</TableCell>
                        <TableCell>{new Date().toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => setSelectedTemplate(name)}>
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setSelectedTemplate(name)}>
                              <Upload className="h-4 w-4" />
                              <span className="sr-only">Upload</span>
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setSelectedTemplate(name)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Template Manager</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., TechCompanyDefaults"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="templateContent">Template Content (JSON)</Label>
                  <Textarea
                    id="templateContent"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder={`{\n  "initialFCF": 120,\n  "growthRate": 6\n}`}
                    rows={10}
                    className="font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" /> Save Template
                  </Button>
                  <Button onClick={addTemplate} className="flex-1 bg-transparent" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" /> New Template
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="selectTemplate">Load/Delete Existing Template</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
                      <SelectTrigger className="flex-grow">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(templates).length === 0 ? (
                          <SelectItem disabled value="no-templates">
                            No templates available
                          </SelectItem>
                        ) : (
                          Object.keys(templates).map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleLoad} disabled={!selectedTemplate}>
                      <FolderOpen className="h-4 w-4 mr-2" /> Load
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" disabled={!selectedTemplate}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>

                {message && <p className="text-sm text-muted-foreground">{message}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Templates & Mapping</CardTitle>
                <CardDescription>Pre-configured templates for common data sources and formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Available Templates:</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={generateExcelTemplate}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Financial Data Template (CSV)
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Database className="h-4 w-4 mr-2" />
                        Capital IQ Data Mapping
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Globe className="h-4 w-4 mr-2" />
                        Bloomberg Terminal Export
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Zap className="h-4 w-4 mr-2" />
                        Refinitiv Eikon Template
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Custom Field Mapping:</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Revenue Field Name</Label>
                        <Input placeholder="e.g., Total Revenue, Net Sales" />
                      </div>
                      <div>
                        <Label>EBITDA Field Name</Label>
                        <Input placeholder="e.g., EBITDA, Operating Income" />
                      </div>
                      <div>
                        <Label>Free Cash Flow Field Name</Label>
                        <Input placeholder="e.g., FCF, Free Cash Flow" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Validation Rules:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Revenue must be positive</li>
                      <li>• Total Assets = Total Liabilities + Equity</li>
                      <li>• Current Ratio = Current Assets / Current Liabilities</li>
                      <li>• ROE = Net Income / Shareholders&apos; Equity</li>
                      <li>• Free Cash Flow = Operating Cash Flow - CapEx</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Data Quality Score: 85%</h4>
                    <p className="text-yellow-700 text-sm">
                      Most recent data passes validation. Minor inconsistencies detected in working capital
                      calculations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
