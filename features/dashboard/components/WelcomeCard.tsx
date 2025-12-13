import { Card, CardContent, CardTitle } from "@/components/ui/card"

export function WelcomeCard() {
  return (
    <Card className="w-full p-8 text-center text-gray-600">
      <CardTitle className="text-xl">Welcome!</CardTitle>
      <CardContent className="mt-4">
        <p>Use the search bar above or fetch live data to begin your stock analysis.</p>
      </CardContent>
    </Card>
  )
}
