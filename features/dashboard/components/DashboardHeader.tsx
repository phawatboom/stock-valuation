import { Button } from "@/components/ui/button"
import { Download, Settings } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Professional Stock Valuation Platform</h1>
          <p className="text-lg text-gray-600">
            Real-time API integration with scenario modeling & comprehensive analysis •
            เครื่องมือวิเคราะห์หุ้นแบบเรียลไทม์พร้อมการจำลองสถานการณ์
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Analysis
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
